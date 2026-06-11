import { Router } from 'express';
import { addPatient, removePatient } from '../services/queueService.js';
import { broadcastQueueState } from '../socket/index.js';

const router = Router();

function handleError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);
  const status = error.statusCode || (error.code === 11000 ? 409 : 500);
  const message =
    error.code === 11000
      ? 'Token conflict — please retry'
      : error.message || fallbackMessage;
  res.status(status).json({ error: message });
}

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const trimmed = name?.trim();

    if (!trimmed) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    if (trimmed.length > 100) {
      return res.status(400).json({ error: 'Patient name must be 100 characters or less' });
    }

    const patient = await addPatient(trimmed);
    const io = req.app.get('io');
    await broadcastQueueState(io);

    res.status(201).json({
      id: patient._id,
      tokenNumber: patient.tokenNumber,
      name: patient.name,
      status: patient.status,
    });
  } catch (error) {
    handleError(res, error, 'Add patient error:');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid patient id' });
    }

    const result = await removePatient(req.params.id);
    const io = req.app.get('io');
    await broadcastQueueState(io);

    res.json({
      message: 'Patient removed from queue',
      removed: {
        id: result.removed._id,
        tokenNumber: result.removed.tokenNumber,
        name: result.removed.name,
      },
      promoted: result.promoted
        ? {
            id: result.promoted._id,
            tokenNumber: result.promoted.tokenNumber,
            name: result.promoted.name,
          }
        : null,
    });
  } catch (error) {
    handleError(res, error, 'Remove patient error:');
  }
});

export default router;
