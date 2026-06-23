import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Settings from '../models/Settings.js';

const SETTINGS_ID = new mongoose.Types.ObjectId('000000000000000000000001');
const TOKEN_NUMBER_BASE = 100;
const LOCK_TIMEOUT_MS = 5000;
const LOCK_POLL_MS = 25;

async function getOrCreateSettings() {
  return Settings.findOneAndUpdate(
    { _id: SETTINGS_ID },
    { $setOnInsert: { consultationTimeMinutes: 10, lastTokenNumber: TOKEN_NUMBER_BASE } },
    { upsert: true, new: true }
  );
}

async function withQueueLock(fn) {
  await getOrCreateSettings();
  const deadline = Date.now() + LOCK_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const acquired = await Settings.findOneAndUpdate(
      {
        _id: SETTINGS_ID,
        $or: [{ queueLocked: false }, { queueLocked: { $exists: false } }],
      },
      { $set: { queueLocked: true, lockedAt: new Date() } },
      { new: true }
    );

    if (acquired) {
      try {
        return await fn();
      } finally {
        await Settings.updateOne({ _id: SETTINGS_ID }, { $set: { queueLocked: false } });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, LOCK_POLL_MS));
  }

  const err = new Error('Queue is busy. Please try again.');
  err.statusCode = 409;
  throw err;
}

export async function getQueueState() {
  const settings = await getOrCreateSettings();

  const [currentPatient, waitingPatients, orphanedServingCount] = await Promise.all([
    Patient.findOne({ status: 'serving' }).sort({ servedAt: -1 }),
    Patient.find({ status: 'waiting' }).sort({ createdAt: 1 }),
    Patient.countDocuments({ status: 'serving' }),
  ]);

  const consultationTime = settings.consultationTimeMinutes;

  return {
    currentToken: currentPatient?.tokenNumber ?? null,
    currentPatientName: currentPatient?.name ?? null,
    waitingQueue: waitingPatients.map((patient, index) => ({
      id: patient._id,
      tokenNumber: patient.tokenNumber,
      name: patient.name,
      createdAt: patient.createdAt,
      position: index + 1,
      estimatedWaitMinutes: (index + 1) * consultationTime,
    })),
    tokensAhead: waitingPatients.length,
    consultationTimeMinutes: consultationTime,
    estimatedWaitMinutes: waitingPatients.length * consultationTime,
    lastTokenNumber: settings.lastTokenNumber,
    queueHealth: orphanedServingCount > 1 ? 'degraded' : 'ok',
  };
}

export async function addPatient(name) {
  const trimmed = name.trim();

  return withQueueLock(async () => {
    // Always sync counter to highest existing token before incrementing
    const highest = await Patient.findOne().sort({ tokenNumber: -1 }).select('tokenNumber');
    if (highest?.tokenNumber) {
      await Settings.updateOne(
        { _id: SETTINGS_ID, lastTokenNumber: { $lt: highest.tokenNumber } },
        { $set: { lastTokenNumber: highest.tokenNumber } }
      );
    }

    await Settings.updateOne(
      { _id: SETTINGS_ID, lastTokenNumber: { $lt: TOKEN_NUMBER_BASE } },
      { $set: { lastTokenNumber: TOKEN_NUMBER_BASE } }
    );

    const settings = await Settings.findOneAndUpdate(
      { _id: SETTINGS_ID },
      { $inc: { lastTokenNumber: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const patient = await Patient.create({
      tokenNumber: settings.lastTokenNumber,
      name: trimmed,
      status: 'waiting',
    });

    return patient;
  });
}

export async function callNextToken() {
  return withQueueLock(async () => {
    const now = new Date();

    await Patient.updateMany(
      { status: 'serving' },
      { $set: { status: 'completed', completedAt: now } }
    );

    const nextPatient = await Patient.findOneAndUpdate(
      { status: 'waiting' },
      { $set: { status: 'serving', servedAt: now } },
      { sort: { createdAt: 1 }, new: true }
    );

    return nextPatient;
  });
}

export async function removePatient(patientId) {
  return withQueueLock(async () => {
    const patient = await Patient.findOne({
      _id: patientId,
      status: { $in: ['waiting', 'serving'] },
    });

    if (!patient) {
      const err = new Error('Patient not found or already removed');
      err.statusCode = 404;
      throw err;
    }

    const wasServing = patient.status === 'serving';
    patient.status = 'cancelled';
    patient.completedAt = new Date();
    await patient.save();

    let promoted = null;
    if (wasServing) {
      promoted = await Patient.findOneAndUpdate(
        { status: 'waiting' },
        { $set: { status: 'serving', servedAt: new Date() } },
        { sort: { createdAt: 1 }, new: true }
      );
    }

    return { removed: patient, promoted };
  });
}

export async function resetQueue() {
  return withQueueLock(async () => {
    const now = new Date();

    await Patient.updateMany(
      { status: { $in: ['waiting', 'serving'] } },
      { $set: { status: 'cancelled', completedAt: now } }
    );

    await Settings.findOneAndUpdate(
      { _id: SETTINGS_ID },
      { $set: { lastTokenNumber: TOKEN_NUMBER_BASE } },
      { upsert: true }
    );

    return { message: 'Queue reset for a new session' };
  });
}

export async function syncTokenCounter() {
  try {
    const highest = await Patient.findOne().sort({ tokenNumber: -1 }).select('tokenNumber');
    if (highest && highest.tokenNumber) {
      await Settings.updateOne(
        { _id: SETTINGS_ID, lastTokenNumber: { $lt: highest.tokenNumber } },
        { $set: { lastTokenNumber: highest.tokenNumber } }
      );
      console.log(`Token counter synced to #${highest.tokenNumber}`);
    }
  } catch (err) {
    console.error('Token sync warning:', err.message);
  }
}

export async function setConsultationTime(minutes) {
  const settings = await getOrCreateSettings();
  settings.consultationTimeMinutes = minutes;
  await settings.save();
  return settings;
}
