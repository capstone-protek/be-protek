import { Router } from 'express';
import { chatbotController } from './chatbot.controller';

const router = Router();

router.post('/', chatbotController.askChat.bind(chatbotController));

export default router;
