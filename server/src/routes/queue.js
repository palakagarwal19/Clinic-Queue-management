import { Router } from 'express';
import { callNextToken, getQueueState, resetQueue } from '../services/queueService.js';
import { broadcastQueueState } from '../socket/index.js';

const router = Router();

function handleError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || fallbackMessage });
}

router.get('/state', async (_req, res) => {
  try {
    const state = await getQueueState();
    res.json(state);
  } catch (error) {
    handleError(res, error, 'Failed to fetch queue state');
  }
});

router.post('/next', async (req, res) => {
  try {
    const patient = await callNextToken();
    const io = req.app.get('io');
    await broadcastQueueState(io);

    if (!patient) {
      return res.json({ message: 'No patients waiting', patient: null });
    }

    res.json({
      message: 'Next patient called',
      patient: {
        id: patient._id,
        tokenNumber: patient.tokenNumber,
        name: patient.name,
        status: patient.status,
      },
    });
  } catch (error) {
    handleError(res, error, 'Call next token error:');
  }
});

router.post('/reset', async (req, res) => {
  try {
    const result = await resetQueue();
    const io = req.app.get('io');
    await broadcastQueueState(io);
    res.json(result);
  } catch (error) {
    handleError(res, error, 'Reset queue error:');
  }
});

export default router;
