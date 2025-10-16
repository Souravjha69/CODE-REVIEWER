import express from 'express';
import aiController from '../controllers/ai.controllers.js';

const router = express.Router();
router.post('/get-response', aiController.getResponse);

export default router;