import { Router } from 'express';
import { addPatient } from '../services/queueService.js';
import { broadcastQueueState } from '../socket/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const patient = await addPatient(name);
    const io = req.app.get('io');
    await broadcastQueueState(io);

    res.status(201).json({
      id: patient._id,
      tokenNumber: patient.tokenNumber,
      name: patient.name,
      status: patient.status,
    });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

export default router;
