import axios from 'axios';
import { env } from '../../shared/config/env.config';
import { AppError } from '../../shared/errors/app-errors';
import logger from '../../shared/libs/logger';
import { ChatbotResponseDTO } from './chatbot.dto';

export class ChatbotService {
  async askChatbot(userMessage: string): Promise<ChatbotResponseDTO> {
    const endpoint = env.CHATGPT_ENDPOINT;
    const apiKey = env.CHATGPT_API_KEY;
    const model = env.CHATGPT_MODEL_NAME;

    if (!apiKey) {
      throw new AppError('Missing CHATGPT_API_KEY environment variable. Chatbot is disabled.', 500);
    }

    const systemPrompt = `
ROLE: Kamu adalah "Intent Classifier" untuk sistem Predictive Maintenance. Kamu TIDAK menjadi asisten chat. Kamu HANYA mengembalikan JSON.

TUGAS: Ambil input user dan terjemahkan menjadi satu perintah JSON terstruktur.

ATURAN KERAS:
- Balas HANYA JSON valid. Jangan menambahkan penjelasan.
- Jangan gunakan markdown.
- Tidak boleh membuat asumsi di luar input.
- Jika user menyebut mesin apa pun, ekstrak sebagai "entity".
- Jika user meminta hal lain di luar predictive maintenance, kembalikan intent "UNKNOWN".

DAFTAR INTENT:
1. GET_MACHINE_STATUS
2. GET_RECENT_ALERTS
3. COUNT_CRITICAL
4. UNKNOWN

OUTPUT FORMAT:
{
  "intent": "NAMA_INTENT",
  "entity": "IDENTIFIER_MESIN" atau null,
  "response_text": "kalimat singkat jika UNKNOWN, selain itu null"
}
`;

    const payload = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    };

    logger.debug(`Calling ChatGPT LLM API for model: ${model}`);

    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000, // 20s timeout
      });

      const rawContent = response.data?.choices?.[0]?.message?.content || '';

      // Clean up markdown code blocks if ChatGPT wrapped the JSON in them
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      cleaned = cleaned.trim();

      try {
        const parsed = JSON.parse(cleaned);
        return {
          intent: parsed.intent || 'UNKNOWN',
          entity: parsed.entity || null,
          response_text: parsed.response_text || null,
        };
      } catch (parseErr) {
        logger.warn(`Failed to parse ChatGPT JSON response string: ${rawContent}`);
        return {
          intent: 'UNKNOWN',
          entity: null,
          response_text: rawContent || 'Maaf, saya tidak memahami permintaan Anda.',
        };
      }
    } catch (err: any) {
      logger.error(`ChatGPT LLM call failed: ${err.message}`);
      throw new AppError(`ChatGPT LLM API failed: ${err.message}`, 502);
    }
  }
}

export const chatbotService = new ChatbotService();
