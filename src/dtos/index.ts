/**
 * ==========================================================
 * DATA TRANSFER OBJECTS (DTOs)
 * ==========================================================
 * These define the API contract (camelCase) that external
 * consumers interact with. They are transformed to/from
 * internal snake_case format for database & ML operations.
 * ==========================================================
 */

// Request DTOs (What API receives from client)
export interface PredictRequestDTO {
  machineId: string;      // e.g., "M-001"
  type: 'L' | 'M' | 'H'; // Operating type
  airTemp: number;        // Air temperature in Kelvin
  processTemp: number;    // Process temperature in Kelvin
  rpm: number;            // Rotational speed
  torque: number;         // Torque in Nm
  toolWear: number;       // Tool wear in minutes
}

// Response DTOs (What API returns to client)
export interface PredictionResponseDTO {
  machineId: string;
  riskProbability: string;      // e.g., "78.3%"
  rulEstimate: string;          // e.g., "120 Minutes"
  rulStatus: string;            // e.g., "🚨 CRITICAL"
  rulMinutes: string;           // Numeric value
  status: string;               // e.g., "⚠️ CRITICAL FAILURE DETECTED"
  failureType?: string;         // e.g., "Power Failure"
  action?: string;              // Recommended action
  urgency?: string;             // Urgency level
  message?: string;             // Additional message
  recommendation?: string;      // Preventive recommendation
  timestamp: string;            // ISO timestamp
}

export interface AlertResponseDTO {
  id: number;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  machineId: number;
  machineName: string;
  machineAsetId: string;
}

export interface SensorHistoryResponseDTO {
  id: number;
  machineId: number;
  sensorType: string;        // Normalized sensor name
  value: number;
  timestamp: string;
}

export interface DashboardSummaryDTO {
  summary: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number;
  };
  recentAlerts: AlertResponseDTO[];
}

export interface MachineDetailDTO {
  id: number;
  asetId: string;
  name: string;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
  createdAt: string;
  updatedAt: string;
}

// Internal format (snake_case for DB & ML)
export interface PredictInternalFormat {
  machine_id: string;
  type: string;
  air_temp: number;
  process_temp: number;
  rpm: number;
  torque: number;
  tool_wear: number;
}

export interface PredictionInternalFormat {
  machine_id: string;
  risk_probability: string;
  rul_estimate: string;
  rul_status: string;
  rul_minutes: string;
  status: string;
  failure_type?: string;
  action?: string;
  urgency?: string;
  message?: string;
  recommendation?: string;
  prediction_time: string;
}
