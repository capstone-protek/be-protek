import prisma from '../../shared/libs/prisma';

export class AlertRepository {
  async findAll() {
    return prisma.alert.findMany({
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

export const alertRepository = new AlertRepository();
