import { FastifyInstance } from 'fastify';
import { DimeSchedulerController } from '../controllers/dimeSchedulerController.js';

export async function dimeSchedulerRoutes(fastify: FastifyInstance) {
  // POST /dime/import - Execute stored procedures
  fastify.post('/dime/import', DimeSchedulerController.executeProcedures);
  
  // POST /dime/job - Create a job
  fastify.post('/dime/job', DimeSchedulerController.createJob);
  
  // POST /dime/task - Create a task
  fastify.post('/dime/task', DimeSchedulerController.createTask);
  
  // POST /dime/job-with-task - Create a job with a task
  fastify.post('/dime/job-with-task', DimeSchedulerController.createJobWithTask);
  
  // GET /dime/test - Test connection to Dime.Scheduler
  fastify.get('/dime/test', DimeSchedulerController.testConnection);
}
