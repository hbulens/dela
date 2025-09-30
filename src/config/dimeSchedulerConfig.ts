import { DimeSchedulerController } from '../controllers/dimeSchedulerController.js';

let globalDimeSchedulerController: DimeSchedulerController | null = null;

export function initializeDimeSchedulerClient(): void {
  const baseUrl = process.env.DIMESCHEDULER_BASE_URL;
  const apiKey = process.env.DIMESCHEDULER_API_KEY;

  if (baseUrl && apiKey) {
    globalDimeSchedulerController = new DimeSchedulerController(baseUrl, apiKey);
    console.log('Dime.Scheduler client initialized');
  } else {
    console.warn('DIMESCHEDULER_BASE_URL or DIMESCHEDULER_API_KEY not found. Dime.Scheduler functionality will be disabled.');
  }
}

export function getDimeSchedulerController(): DimeSchedulerController | null {
  return globalDimeSchedulerController;
}
