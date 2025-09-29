import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes/index.js';
import { initializeEmailService } from './config/emailConfig.js';
import { initializeDimeSchedulerClient } from './config/dimeSchedulerConfig.js';

// Load environment variables from .env file
dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register CORS plugin
await fastify.register(cors, {
  origin: true
});

// Initialize services
initializeEmailService();
initializeDimeSchedulerClient();

// Register all routes
await fastify.register(registerRoutes);

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
