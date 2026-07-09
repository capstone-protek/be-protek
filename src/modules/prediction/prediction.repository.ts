import prisma from '../../shared/libs/prisma';

export class PredictionRepository {
  async savePredictionWorkflow(params: {
    machineId: number;
    asetId: string;
    sensorHistory: Array<{ type: string; value: number }>;
    predictionResult: {
      machine_id: string;
      risk_probability: string;
      rul_estimate: string;
      rul_status: string;
      rul_minutes: string;
      status: string;
      failure_type?: string;
      action?: string;
      urgency?: string;
    };
    createAlert?: { message: string; severity: string } | undefined;
    updateMachineStatus?: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE' | undefined;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Save sensor history
      await tx.sensorHistory.createMany({
        data: params.sensorHistory.map((sensor) => ({
          machineId: params.machineId,
          type: sensor.type,
          value: sensor.value,
        })),
      });

      // 2. Save prediction result
      await tx.prediction_results.create({
        data: {
          machine_id: params.asetId,
          risk_probability: params.predictionResult.risk_probability,
          rul_estimate: params.predictionResult.rul_estimate,
          rul_status: params.predictionResult.rul_status,
          rul_minutes_val: parseFloat(params.predictionResult.rul_minutes) || 0,
          pred_status: params.predictionResult.status,
          failure_type: params.predictionResult.failure_type || '',
          action: params.predictionResult.action || '',
          urgency: params.predictionResult.urgency || '',
        },
      });

      // 3. Create Alert if needed
      if (params.createAlert) {
        await tx.alert.create({
          data: {
            machineId: params.machineId,
            message: params.createAlert.message,
            severity: params.createAlert.severity,
          },
        });
      }

      // 4. Update Machine Status if needed
      if (params.updateMachineStatus) {
        await tx.machine.update({
          where: { id: params.machineId },
          data: { status: params.updateMachineStatus },
        });
      }
    });
  }
}

export const predictionRepository = new PredictionRepository();
