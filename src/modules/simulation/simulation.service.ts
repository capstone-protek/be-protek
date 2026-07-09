import { env } from '../../shared/config/env.config';
import { AppError } from '../../shared/errors/app-errors';
import logger from '../../shared/libs/logger';

export class SimulationService {
  private getMLUrl(path: string): string {
    const baseUrl = env.ML_API_URL.replace(/\/$/, '');
    return `${baseUrl}${path}`;
  }

  async startSimulation(payload: any) {
    const targetUrl = this.getMLUrl('/api/simulation/start');
    logger.info(`Triggering ML API Simulation Start at: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload || {}),
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        logger.error(`Non-JSON response from ML API on start: ${text}`);
        throw new AppError(`ML API non-JSON response: ${text.substring(0, 100)}`, 502);
      }

      const data = (await response.json()) as any;
      if (!response.ok) {
        throw new AppError(data.message || 'Failed to start simulation on ML API', response.status);
      }

      return data;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.error(`Simulation start call failed: ${err.message}`);
      throw new AppError(`Failed to trigger simulation start: ${err.message}`, 502);
    }
  }

  async stopSimulation() {
    const targetUrl = this.getMLUrl('/api/simulation/stop');
    logger.info(`Triggering ML API Simulation Stop at: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        logger.error(`Non-JSON response from ML API on stop: ${text}`);
        throw new AppError(`ML API non-JSON response: ${text.substring(0, 100)}`, 502);
      }

      const data = (await response.json()) as any;
      if (!response.ok) {
        throw new AppError(data.message || 'Failed to stop simulation on ML API', response.status);
      }

      return data;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      logger.error(`Simulation stop call failed: ${err.message}`);
      throw new AppError(`Failed to trigger simulation stop: ${err.message}`, 502);
    }
  }

  async getSimulationStatus() {
    logger.debug('Fetching simulation status');
    // Static response matching original controller
    return {
      status: 'success',
      message: 'Simulation functionality is ready (Trigger Mode)',
      note: 'Ensure Python backend has /api/start-simulation endpoint',
    };
  }
}

export const simulationService = new SimulationService();
