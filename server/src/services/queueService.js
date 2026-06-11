import Patient from '../models/Patient.js';
import Settings from '../models/Settings.js';

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

export async function getQueueState() {
  const settings = await getOrCreateSettings();

  const [currentPatient, waitingPatients, servingCount] = await Promise.all([
    Patient.findOne({ status: 'serving' }).sort({ servedAt: -1 }),
    Patient.find({ status: 'waiting' }).sort({ createdAt: 1 }),
    Patient.countDocuments({ status: 'serving' }),
  ]);

  const consultationTime = settings.consultationTimeMinutes;

  return {
    currentToken: currentPatient?.tokenNumber ?? null,
    currentPatientName: currentPatient?.name ?? null,
    waitingQueue: waitingPatients.map((p) => ({
      id: p._id,
      tokenNumber: p.tokenNumber,
      name: p.name,
      createdAt: p.createdAt,
    })),
    tokensAhead: waitingPatients.length,
    consultationTimeMinutes: consultationTime,
    estimatedWaitMinutes: waitingPatients.length * consultationTime,
    lastTokenNumber: settings.lastTokenNumber,
  };
}

export async function addPatient(name) {
  const settings = await getOrCreateSettings();
  const nextToken = settings.lastTokenNumber + 1;

  const patient = await Patient.create({
    tokenNumber: nextToken,
    name: name.trim(),
    status: 'waiting',
  });

  settings.lastTokenNumber = nextToken;
  await settings.save();

  return patient;
}

export async function callNextToken() {
  const currentServing = await Patient.findOne({ status: 'serving' });
  if (currentServing) {
    currentServing.status = 'completed';
    currentServing.completedAt = new Date();
    await currentServing.save();
  }

  const nextPatient = await Patient.findOne({ status: 'waiting' }).sort({ createdAt: 1 });
  if (!nextPatient) {
    return null;
  }

  nextPatient.status = 'serving';
  nextPatient.servedAt = new Date();
  await nextPatient.save();

  return nextPatient;
}

export async function setConsultationTime(minutes) {
  const settings = await getOrCreateSettings();
  settings.consultationTimeMinutes = minutes;
  await settings.save();
  return settings;
}
