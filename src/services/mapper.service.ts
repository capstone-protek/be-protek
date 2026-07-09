/**
 * ==========================================================
 * NAMING CONVENTION MAPPER
 * ==========================================================
 * Handles bidirectional transformation between:
 * - camelCase (API layer - external)
 * - snake_case (DB & ML layer - internal)
 * 
 * This ensures clean separation of concerns and makes
 * it easy to change conventions in the future.
 * ==========================================================
 */

import {
  PredictRequestDTO,
  PredictInternalFormat,
  PredictionInternalFormat,
  PredictionResponseDTO,
  AlertResponseDTO,
  SensorHistoryResponseDTO,
} from '../dtos';

/**
 * Transform API request (camelCase) to internal format (snake_case)
 */
export function requestDTOToInternal(dto: PredictRequestDTO): PredictInternalFormat {
  return {
    machine_id: dto.machineId,
    type: dto.type,
    air_temp: dto.airTemp,
    process_temp: dto.processTemp,
    rpm: dto.rpm,
    torque: dto.torque,
    tool_wear: dto.toolWear,
  };
}

/**
 * Transform internal format (snake_case) to API response (camelCase)
 */
export function internalPredictionToResponseDTO(
  internal: PredictionInternalFormat
): PredictionResponseDTO {
  const response: PredictionResponseDTO = {
    machineId: internal.machine_id,
    riskProbability: internal.risk_probability,
    rulEstimate: internal.rul_estimate,
    rulStatus: internal.rul_status,
    rulMinutes: internal.rul_minutes,
    status: internal.status,
    timestamp: internal.prediction_time,
  };

  // Only include optional fields if they have values
  if (internal.failure_type) response.failureType = internal.failure_type;
  if (internal.action) response.action = internal.action;
  if (internal.urgency) response.urgency = internal.urgency;
  if (internal.message) response.message = internal.message;
  if (internal.recommendation) response.recommendation = internal.recommendation;

  return response;
}

/**
 * Transform ML API response (UPPER_CASE) to internal format (snake_case)
 * ML API returns fields like: Machine_ID, Risk_Probability, RUL_Estimate, etc.
 */
export function mlResponseToInternal(mlResponse: any): PredictionInternalFormat {
  return {
    machine_id: mlResponse.Machine_ID || '',
    risk_probability: mlResponse.Risk_Probability || '0%',
    rul_estimate: mlResponse.RUL_Estimate || 'Unknown',
    rul_status: mlResponse.RUL_Status || 'Unknown',
    rul_minutes: mlResponse.RUL_Minutes || '0',
    status: mlResponse.Status || 'Unknown',
    failure_type: mlResponse.Failure_Type || undefined,
    action: mlResponse.Action || undefined,
    urgency: mlResponse.Urgency || undefined,
    message: mlResponse.Message || undefined,
    recommendation: mlResponse.Recommendation || undefined,
    prediction_time: new Date().toISOString(),
  };
}

/**
 * Transform internal sensor data to API response (camelCase)
 */
export function sensorHistoryToDTO(data: any): SensorHistoryResponseDTO {
  return {
    id: data.id,
    machineId: data.machineId,
    sensorType: normalizeSensorType(data.type),
    value: data.value,
    timestamp: new Date(data.timestamp).toISOString(),
  };
}

/**
 * Transform internal alert to API response (camelCase)
 */
export function alertToDTO(alert: any, machine: any): AlertResponseDTO {
  return {
    id: alert.id,
    message: alert.message,
    severity: alert.severity as 'CRITICAL' | 'WARNING' | 'INFO',
    timestamp: new Date(alert.timestamp).toISOString(),
    machineId: alert.machineId,
    machineName: machine?.name || 'Unknown',
    machineAsetId: machine?.asetId || 'Unknown',
  };
}

/**
 * Normalize sensor type names to consistent format
 * Input can be: "Air_Temp", "Air temperature [K]", "airTemp", etc.
 * Output: standardized lowercase snake_case
 */
export function normalizeSensorType(input: string): string {
  const typeMap: { [key: string]: string } = {
    // Frontend input variations
    'Air_Temp': 'air_temperature',
    'airTemp': 'air_temperature',
    'air_temp': 'air_temperature',
    'Air temperature [K]': 'air_temperature',

    'Process_Temp': 'process_temperature',
    'processTemp': 'process_temperature',
    'process_temp': 'process_temperature',
    'Process temperature [K]': 'process_temperature',

    'RPM': 'rotational_speed',
    'rpm': 'rotational_speed',
    'Rotational speed [rpm]': 'rotational_speed',

    'Torque': 'torque',
    'torque': 'torque',
    'Torque [Nm]': 'torque',

    'Tool_Wear': 'tool_wear',
    'toolWear': 'tool_wear',
    'tool_wear': 'tool_wear',
    'Tool wear [min]': 'tool_wear',

    // Fallback: lowercase and replace spaces with underscores
  };

  return typeMap[input] || input.toLowerCase().replace(/\s+/g, '_').replace(/\[.*\]/g, '').trim();
}

/**
 * Inverse: Convert normalized sensor type back to camelCase for response
 */
export function denormalizeSensorType(normalized: string): string {
  const inverseMap: { [key: string]: string } = {
    'air_temperature': 'Air Temperature',
    'process_temperature': 'Process Temperature',
    'rotational_speed': 'RPM',
    'torque': 'Torque',
    'tool_wear': 'Tool Wear',
  };

  return inverseMap[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Validation & Error Handling
 */
export function validatePredictRequest(dto: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!dto.machineId || typeof dto.machineId !== 'string') {
    errors.push('machineId must be a non-empty string');
  }

  if (!['L', 'M', 'H'].includes(dto.type)) {
    errors.push("type must be 'L', 'M', or 'H'");
  }

  if (typeof dto.airTemp !== 'number' || dto.airTemp <= 0) {
    errors.push('airTemp must be a positive number');
  }

  if (typeof dto.processTemp !== 'number' || dto.processTemp <= 0) {
    errors.push('processTemp must be a positive number');
  }

  if (typeof dto.rpm !== 'number' || dto.rpm <= 0) {
    errors.push('rpm must be a positive number');
  }

  if (typeof dto.torque !== 'number' || dto.torque < 0) {
    errors.push('torque must be a non-negative number');
  }

  if (typeof dto.toolWear !== 'number' || dto.toolWear < 0) {
    errors.push('toolWear must be a non-negative number');
  }

  if (dto.processTemp < dto.airTemp) {
    errors.push('processTemp must be >= airTemp (physics constraint)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
