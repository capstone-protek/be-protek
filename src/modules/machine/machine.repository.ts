import prisma from '../../shared/libs/prisma';

export class MachineRepository {
  async findAll() {
    return prisma.machine.findMany({
      orderBy: { name: 'asc' },
      include: {
        alerts: {
          where: { severity: 'CRITICAL' },
          take: 1,
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.machine.findUnique({
      where: { id },
    });
  }

  async findByAsetId(asetId: string) {
    return prisma.machine.findUnique({
      where: { asetId },
    });
  }

  async findHistoryByMachineId(machineId: number, limit: number = 50) {
    return prisma.sensorHistory.findMany({
      where: { machineId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }
}

export const machineRepository = new MachineRepository();
