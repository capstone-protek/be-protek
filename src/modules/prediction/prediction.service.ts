import { env } from '../../shared/config/env.config';
import { machineRepository } from '../machine/machine.repository';
import { predictionRepository } from './prediction.repository';
import { predictionMapper } from './prediction.mapper';
import { PredictRequestDTO, PredictionResponseDTO } from './prediction.dto';
import { NotFoundError, AppError } from '../../shared/errors/app-errors';
import logger from '../../shared/libs/logger';

export class PredictionService {
  async predict(dto: PredictRequestDTO): Promise<PredictionResponseDTO> {
    logger.info(`Processing prediction for machine: ${dto.machineId}`);

    // 1. Check if machine exists in database
    const machine = await machineRepository.findByAsetId(dto.machineId);
    if (!machine) {
      logger.warn(`Machine ${dto.machineId} not found in database`);
      throw new NotFoundError(`Machine with asetId '${dto.machineId}' not found`);
    }

    // 2. Map request DTO to internal format
    const internalData = predictionMapper.requestDTOToInternal(dto);

    // 3. Prepare payload for ML API (expects PascalCase)
    const mlPayload = {
      Machine_ID: internalData.machine_id,
      Type: internalData.type,
      Air_Temp: internalData.air_temp,
      Process_Temp: internalData.process_temp,
      RPM: internalData.rpm,
      Torque: internalData.torque,
      Tool_Wear: internalData.tool_wear,
    };

    // 4. Resolve ML API URL (append /predict if missing)
    const baseUrl = env.ML_API_URL.replace(/\/$/, '');
    const targetUrl = baseUrl.endsWith('/predict') ? baseUrl : `${baseUrl}/predict`;

    logger.debug(`Calling ML API at: ${targetUrl}`);

    let mlResultRaw: any;
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(mlPayload),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status} ${response.statusText}`);
      }

      mlResultRaw = await response.json();
      logger.debug('ML API response received successfully');
    } catch (err: any) {
      logger.error(`ML API Call failed: ${err.message}`);
      throw new AppError(`ML API connection failed: ${err.message}`, 502);
    }

    // 5. Map ML response to internal snake_case format
    const internalPrediction = predictionMapper.mlResponseToInternal(mlResultRaw);
    
    // Maintain the requested machine_id consistency
    internalPrediction.machine_id = dto.machineId;

    // 6. Check if prediction indicates critical conditions
    const isCritical =
      internalPrediction.rul_status?.includes('CRITICAL') ||
      internalPrediction.status?.includes('FAILURE');

    let createAlert: { message: string; severity: string } | undefined;
    let updateMachineStatus: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE' | undefined;

    if (isCritical) {
      let alertMessage = internalPrediction.message || 'Critical Anomaly Detected';
      
      if (!internalPrediction.message && internalPrediction.failure_type) {
        alertMessage = `${internalPrediction.failure_type}: ${
          internalPrediction.action || 'Check Machine Immediately'
        }`;
        if (internalPrediction.urgency) {
          alertMessage += ` (${internalPrediction.urgency})`;
        }
      }

      createAlert = {
        message: alertMessage,
        severity: 'CRITICAL',
      };
      
      updateMachineStatus = 'CRITICAL';
      logger.warn(`Critical failure predicted for machine ${dto.machineId}. Preparing alert.`);
    }

    // 7. Execute all database writes in a transaction
    const sensorHistory = [
      { type: 'air_temperature', value: internalData.air_temp },
      { type: 'process_temperature', value: internalData.process_temp },
      { type: 'rotational_speed', value: internalData.rpm },
      { type: 'torque', value: internalData.torque },
      { type: 'tool_wear', value: internalData.tool_wear },
    ];

    try {
      await predictionRepository.savePredictionWorkflow({
        machineId: machine.id,
        asetId: machine.asetId,
        sensorHistory,
        predictionResult: internalPrediction,
        createAlert,
        updateMachineStatus,
      });
      logger.info(`Successfully persisted sensor data, prediction result, and alerts for ${dto.machineId}`);
    } catch (err: any) {
      logger.error(`Database transaction failed: ${err.message}`);
      throw new AppError(`Failed to save prediction records: ${err.message}`, 500);
    }

    // 8. Transform internal result to response DTO
    return predictionMapper.internalPredictionToResponseDTO(internalPrediction);
  }
}

export const predictionService = new PredictionService();
