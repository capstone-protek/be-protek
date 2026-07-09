import { z } from 'zod';

export const predictRequestSchema = z.object({
  body: z
    .object({
      machineId: z.string().min(1, 'machineId must be a non-empty string'),
      type: z.enum(['L', 'M', 'H']),
      airTemp: z.number().positive('airTemp must be a positive number'),
      processTemp: z.number().positive('processTemp must be a positive number'),
      rpm: z.number().positive('rpm must be a positive number'),
      torque: z.number().nonnegative('torque must be a non-negative number'),
      toolWear: z.number().nonnegative('toolWear must be a non-negative number'),
    })
    .refine((data) => data.processTemp >= data.airTemp, {
      message: 'processTemp must be >= airTemp (physics constraint)',
      path: ['processTemp'],
    }),
});
