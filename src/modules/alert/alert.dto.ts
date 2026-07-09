export interface AlertResponseDTO {
  id: number;
  machineId: number;
  message: string;
  severity: string;
  timestamp: string;
  machine?: {
    name: string;
    asetId: string;
  } | undefined;
}
