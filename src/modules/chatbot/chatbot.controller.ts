import { Request, Response, NextFunction } from 'express';
import { chatbotService } from './chatbot.service';
import { ValidationError } from '../../shared/errors/app-errors';

export class ChatbotController {
  async askChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        throw new ValidationError('Message must be a non-empty string');
      }

      const result = await chatbotService.askChatbot(message);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const chatbotController = new ChatbotController();
