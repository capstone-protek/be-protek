import prisma from '../../shared/libs/prisma';

export class DashboardRepository {
  async countTotalMachines() {
    return prisma.machine.count();
  }

  async countCriticalMachines() {
    return prisma.machine.count({
      where: {
        status: {
          in: ['CRITICAL', 'WARNING'],
        },
      },
    });
  }

  async countAlertsSince(since: Date) {
    return prisma.alert.count({
      where: {
        timestamp: {
          gte: since,
        },
      },
    });
  }

  async findRecentAlerts(limit: number = 5) {
    return prisma.alert.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        machine: {
          select: {
            name: true,
            asetId: true,
          },
        },
      },
    });
  }
}

export const dashboardRepository = new DashboardRepository();
