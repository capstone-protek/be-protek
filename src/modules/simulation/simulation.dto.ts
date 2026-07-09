export interface SimulationStartDTO {
  speedMultiplier?: number;
  [key: string]: any;
}

export interface SimulationResponseDTO {
  status: string;
  message: string;
  [key: string]: any;
}
