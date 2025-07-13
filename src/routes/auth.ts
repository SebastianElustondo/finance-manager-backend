import { Router } from 'express';

const router = Router();

// Auth routes will be implemented later
router.get('/health', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

export default router; 