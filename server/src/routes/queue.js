import { Router } from 'express';
import { callNextToken, getQueueState } from '../services/queueService.js';
import { broadcastQueueState } from '../socket/index.js';

const router = Router();

router.get('/state', async (_req, res) => {
  try {
    const state = await getQueueState();
    res.json(state);
  } catch (error) {
    console.error('Get queue state error:', error);
    res.status(500).json({ error: 'Failed to fetch queue state' });
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
    console.error('Call next token error:', error);
    res.status(500).json({ error: 'Failed to call next token' });
  }
});

export default router;
