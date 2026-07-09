/*
 * ==========================================================
 * LEGACY TYPE DEFINITIONS
 * ==========================================================
 * These are kept for backward compatibility.
 * NEW CODE should use DTOs from src/dtos/index.ts
 * 
 * The naming convention is:
 * - camelCase: External API (request/response)
 * - snake_case: Internal (database, ML, processing)
 * ==========================================================
 */

import { PredictRequestDTO, PredictionResponseDTO } from '../dtos';

// Re-export DTOs for backward compatibility
export type PredictPayload = PredictRequestDTO;
export type MLResponse = PredictionResponseDTO;
export type DashboardSummaryResponse = any;

// Legacy enums (keep for now, but use DTOs in new code)
export type MachineStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

// Legacy AlertData interface (for mockData.ts compatibility)
export interface AlertData {
  id: number;
  message: string;
  severity: string;
  timestamp: Date | string;
  machine: {
    name: string;
    asetId: string;
  };
}

export interface PredictResponseFE {
  status: 'success' | 'error';
  input_saved: boolean;
  ml_result: MLResponse;
  alert_created?: boolean;
}