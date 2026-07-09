import { machineRepository } from './machine.repository';
import { NotFoundError } from '../../shared/errors/app-errors';
import logger from '../../shared/libs/logger';

export class MachineService {
  async getMachines() {
    logger.debug('Fetching all machines');
    return machineRepository.findAll();
  }

  async getMachineDetail(id: string) {
    logger.debug(`Fetching machine detail for ID: ${id}`);
    let machine;

    if (!isNaN(Number(id))) {
      machine = await machineRepository.findById(Number(id));
    } else {
      machine = await machineRepository.findByAsetId(id);
    }

    if (!machine) {
      throw new NotFoundError(`Machine with ID or AsetId '${id}' not found`);
    }

    return machine;
  }

  async getMachineHistory(id: string) {
    logger.debug(`Fetching machine sensor history for ID: ${id}`);
    let machineIdInt: number;

    if (!isNaN(Number(id))) {
      machineIdInt = Number(id);
    } else {
      const machine = await machineRepository.findByAsetId(id);
      if (!machine) {
        throw new NotFoundError(`Machine with AsetId '${id}' not found`);
      }
      machineIdInt = machine.id;
    }

    const history = await machineRepository.findHistoryByMachineId(machineIdInt);
    
    // Reverse to return Oldest -> Newest (left-to-right on frontend graphs)
    return history.reverse();
  }
}

export const machineService = new MachineService();
