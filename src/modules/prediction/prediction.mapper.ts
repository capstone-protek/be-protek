import { PredictRequestDTO, PredictionResponseDTO } from './prediction.dto';

export class PredictionMapper {
  requestDTOToInternal(dto: PredictRequestDTO) {
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

  internalPredictionToResponseDTO(internal: {
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
  }): PredictionResponseDTO {
    const response: PredictionResponseDTO = {
      machineId: internal.machine_id,
      riskProbability: internal.risk_probability,
      rulEstimate: internal.rul_estimate,
      rulStatus: internal.rul_status,
      rulMinutes: internal.rul_minutes,
      status: internal.status,
      timestamp: internal.prediction_time,
    };

    if (internal.failure_type) response.failureType = internal.failure_type;
    if (internal.action) response.action = internal.action;
    if (internal.urgency) response.urgency = internal.urgency;
    if (internal.message) response.message = internal.message;
    if (internal.recommendation) response.recommendation = internal.recommendation;

    return response;
  }

  mlResponseToInternal(mlResponse: any) {
    return {
      machine_id: mlResponse.Machine_ID || '',
      risk_probability: mlResponse.Risk_Probability || '0%',
      rul_estimate: mlResponse.RUL_Estimate || 'Unknown',
      rul_status: mlResponse.RUL_Status || 'Unknown',
      rul_minutes: String(mlResponse.RUL_Minutes) || '0',
      status: mlResponse.Status || 'Unknown',
      failure_type: mlResponse.Failure_Type || undefined,
      action: mlResponse.Action || undefined,
      urgency: mlResponse.Urgency || undefined,
      message: mlResponse.Message || undefined,
      recommendation: mlResponse.Recommendation || undefined,
      prediction_time: new Date().toISOString(),
    };
  }
}

export const predictionMapper = new PredictionMapper();
