import { alertRepository } from './alert.repository';
import { AlertResponseDTO } from './alert.dto';
import logger from '../../shared/libs/logger';

export class AlertService {
  async getAlerts(): Promise<AlertResponseDTO[]> {
    logger.debug('Fetching all alerts from database');
    const alerts = await alertRepository.findAll();

    return alerts.map((alert) => ({
      id: alert.id,
      machineId: alert.machineId,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp.toISOString(),
      machine: alert.machine
        ? {
            name: alert.machine.name,
            asetId: alert.machine.asetId,
          }
        : undefined,
    }));
  }
}

export const alertService = new AlertService();
