"use strict";

// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Import your app configuration
import { registerRoutes } from "../src/routes/index.js";
import { initializeEmailService } from "../src/config/emailConfig.js";
import { initializeDimeSchedulerClient } from "../src/config/dimeSchedulerConfig.js";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true
});

// Register CORS plugin
await app.register(import("@fastify/cors"), {
  origin: true
});

// Initialize services
initializeEmailService();
initializeDimeSchedulerClient();

// Register all routes
await app.register(registerRoutes);

export default async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
};
