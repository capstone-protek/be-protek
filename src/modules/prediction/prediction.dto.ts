export interface PredictRequestDTO {
  machineId: string;      // e.g. "M-001"
  type: 'L' | 'M' | 'H'; // Product quality/type
  airTemp: number;        // Kelvin
  processTemp: number;    // Kelvin
  rpm: number;            // Rotational speed
  torque: number;         // Torque in Nm
  toolWear: number;       // Tool wear in minutes
}

export interface PredictionResponseDTO {
  machineId: string;
  riskProbability: string;
  rulEstimate: string;
  rulStatus: string;
  rulMinutes: string;
  status: string;
  failureType?: string;
  action?: string;
  urgency?: string;
  message?: string;
  recommendation?: string;
  timestamp: string;
}
