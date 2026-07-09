export interface ChatbotRequestDTO {
  message: string;
}

export interface ChatbotResponseDTO {
  intent: 'GET_MACHINE_STATUS' | 'GET_RECENT_ALERTS' | 'COUNT_CRITICAL' | 'UNKNOWN';
  entity: string | null;
  response_text: string | null;
}
