import { FastifyInstance } from 'fastify';
import { webhookRoutes } from './webhookRoutes.js';
import { mailerRoutes } from './mailerRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { dimeSchedulerRoutes } from './dimeSchedulerRoutes.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Register all route modules
  await fastify.register(webhookRoutes);
  await fastify.register(mailerRoutes);
  await fastify.register(healthRoutes);
  await fastify.register(dimeSchedulerRoutes);
}
