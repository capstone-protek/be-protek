import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  PredictRequestDTO,
  PredictionResponseDTO,
} from '../dtos';
import {
  requestDTOToInternal,
  mlResponseToInternal,
  internalPredictionToResponseDTO,
  normalizeSensorType,
  validatePredictRequest,
} from '../services/mapper.service';

const prisma = new PrismaClient();

// ML API URL (Local development or Railway)
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/predict';

export const predictMaintenance = async (req: Request, res: Response) => {
  try {
    // 1. VALIDATE & PARSE INPUT (camelCase from API)
    const requestData = req.body as PredictRequestDTO;
    
    const validation = validatePredictRequest(requestData);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid prediction request',
        errors: validation.errors
      });
    }

    console.log(`\n📊 [Predict] Processing prediction for ${requestData.machineId}...`);

    // 2. TRANSFORM: camelCase API → snake_case internal format
    const internalData = requestDTOToInternal(requestData);

    // 3. CHECK IF MACHINE EXISTS IN LOCAL DB
    const machine = await prisma.machine.findUnique({
      where: { asetId: internalData.machine_id }
    });

    if (machine) {
      console.log(`   ✅ Machine found in database (ID: ${machine.id})`);
      
      // Save sensor history for analytics & real-time graphs
      const sensorTypes = [
        { type: 'air_temperature', value: internalData.air_temp },
        { type: 'process_temperature', value: internalData.process_temp },
        { type: 'rotational_speed', value: internalData.rpm },
        { type: 'torque', value: internalData.torque },
        { type: 'tool_wear', value: internalData.tool_wear },
      ];

      await prisma.sensorHistory.createMany({
        data: sensorTypes.map(sensor => ({
          machineId: machine.id,
          type: sensor.type,
          value: sensor.value,
        }))
      });
      console.log(`   💾 Sensor history saved (${sensorTypes.length} records)`);
    } else {
      console.warn(`   ⚠️  Machine ${internalData.machine_id} not found in DB`);
    }

    // 4. SEND TO ML API (Convert to ML expected format if needed)
    // ML API expects PascalCase like: Machine_ID, Air_Temp, etc.
    // So we convert our internal snake_case to what ML API expects
    const mlPayload = {
      Machine_ID: internalData.machine_id,
      Type: internalData.type,
      Air_Temp: internalData.air_temp,
      Process_Temp: internalData.process_temp,
      RPM: internalData.rpm,
      Torque: internalData.torque,
      Tool_Wear: internalData.tool_wear,
    };

    console.log(`   📡 Sending to ML API: ${ML_API_URL}`);
    
    const mlResponse = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(mlPayload),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!mlResponse.ok) {
      throw new Error(`ML API Error: ${mlResponse.status} ${mlResponse.statusText}`);
    }

    const mlResultRaw = await mlResponse.json();
    console.log(`   ✅ ML API response received`);

    // 5. TRANSFORM: ML API response → internal format (snake_case)
    const internalPrediction = mlResponseToInternal(mlResultRaw);

    // 6. SAVE PREDICTION RESULT TO DATABASE
    if (machine) {
      await prisma.prediction_results.create({
        data: {
          machine_id: internalPrediction.machine_id,
          risk_probability: internalPrediction.risk_probability,
          rul_estimate: internalPrediction.rul_estimate,
          rul_status: internalPrediction.rul_status,
          rul_minutes_val: parseFloat(internalPrediction.rul_minutes) || 0,
          pred_status: internalPrediction.status,
          failure_type: internalPrediction.failure_type || '',
          action: internalPrediction.action || '',
          urgency: internalPrediction.urgency || '',
        }
      });
      console.log(`   💾 Prediction result saved to database`);
    }

    // 7. CREATE ALERT IF CRITICAL
    const isCritical = 
      (internalPrediction.rul_status?.includes('CRITICAL')) || 
      (internalPrediction.status?.includes('FAILURE'));
    
    if (isCritical && machine) {
      // Build alert message
      let alertMessage = internalPrediction.message || 'Critical Anomaly Detected';
      
      if (!internalPrediction.message && internalPrediction.failure_type) {
        alertMessage = `${internalPrediction.failure_type}: ${internalPrediction.action || 'Check Machine Immediately'}`;
        if (internalPrediction.urgency) {
          alertMessage += ` (${internalPrediction.urgency})`;
        }
      }

      await prisma.alert.create({
        data: {
          machineId: machine.id,
          message: alertMessage,
          severity: 'CRITICAL',
        }
      });

      // Update machine status
      await prisma.machine.update({
        where: { id: machine.id },
        data: { status: 'CRITICAL' }
      });

      console.log(`   🚨 CRITICAL ALERT CREATED!`);
    }

    // 8. TRANSFORM: internal format → camelCase API response
    const responseDTO: PredictionResponseDTO = 
      internalPredictionToResponseDTO(internalPrediction);

    console.log(`   ✨ Prediction complete\n`);

    res.json({
      status: 'success',
      data: responseDTO,
      databaseSaved: !!machine,
      alertCreated: isCritical && !!machine,
    });

  } catch (error: any) {
    console.error('❌ Prediction Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process prediction request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};