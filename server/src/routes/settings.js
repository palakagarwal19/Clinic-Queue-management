import { Router } from 'express';
import { setConsultationTime } from '../services/queueService.js';
import { broadcastQueueState } from '../socket/index.js';

const router = Router();

router.put('/consultation-time', async (req, res) => {
  try {
    const { minutes } = req.body;
    const parsed = Number(minutes);

    if (!parsed || parsed < 1 || parsed > 120) {
      return res.status(400).json({ error: 'Consultation time must be between 1 and 120 minutes' });
    }

    const settings = await setConsultationTime(parsed);
    const io = req.app.get('io');
    await broadcastQueueState(io);

    res.json({
      consultationTimeMinutes: settings.consultationTimeMinutes,
    });
  } catch (error) {
    console.error('Set consultation time error:', error);
    res.status(500).json({ error: 'Failed to update consultation time' });
  }
});

export default router;
