import express from 'express';
import aiController from '../controllers/ai.controllers.js';

const router = express.Router();
router.post('/get-review', aiController.getReview);

export default router;