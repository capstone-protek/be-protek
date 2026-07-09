import { MachineStatus } from '@prisma/client';

export interface MachineResponseDTO {
  id: number;
  asetId: string;
  name: string;
  status: MachineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SensorHistoryResponseDTO {
  id: number;
  type: string;
  value: number;
  timestamp: string;
  machineId: number;
}
