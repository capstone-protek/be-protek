import { dashboardRepository } from './dashboard.repository';
import { DashboardSummaryDTO } from './dashboard.dto';
import logger from '../../shared/libs/logger';

export class DashboardService {
  async getSummary(): Promise<DashboardSummaryDTO> {
    logger.debug('Gathering dashboard summary metrics');

    // 1. Calculate start of today (00:00:00.000)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Query all database metrics in parallel for speed
    const [totalMachines, criticalMachines, todaysAlerts, recentAlertsRaw] = await Promise.all([
      dashboardRepository.countTotalMachines(),
      dashboardRepository.countCriticalMachines(),
      dashboardRepository.countAlertsSince(startOfToday),
      dashboardRepository.findRecentAlerts(5),
    ]);

    // 3. Calculate system health (100% minus 15% per critical/warning machine)
    const systemHealth = Math.max(0, 100 - criticalMachines * 15);

    // 4. Map raw DB results to DTO
    const recentAlerts = recentAlertsRaw.map((alert) => ({
      id: alert.id,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp.toISOString(),
      machine: {
        name: alert.machine.name,
        asetId: alert.machine.asetId,
      },
    }));

    return {
      summary: {
        totalMachines,
        criticalMachines,
        todaysAlerts,
        systemHealth,
      },
      recentAlerts,
    };
  }
}

export const dashboardService = new DashboardService();
