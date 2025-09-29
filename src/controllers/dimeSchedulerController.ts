import { FastifyRequest, FastifyReply } from 'fastify';
import { DimeSchedulerClient } from '../services/dimeSchedulerClient.js';
import { DimeSchedulerProcedure } from '../types/dimeScheduler.js';

export class DimeSchedulerController {
  private static client: DimeSchedulerClient | null = null;

  /**
   * Initialize the Dime.Scheduler client
   */
  static initializeClient(baseUrl: string, apiKey: string): void {
    this.client = new DimeSchedulerClient({
      baseUrl,
      apiKey,
      timeout: 30000
    });
    console.log('Dime.Scheduler client initialized');
  }

  /**
   * Get the initialized client or throw error
   */
  private static getClient(): DimeSchedulerClient {
    if (!this.client) {
      throw new Error('Dime.Scheduler client not initialized. Please set DIMESCHEDULER_BASE_URL and DIMESCHEDULER_API_KEY environment variables.');
    }
    return this.client;
  }

  /**
   * POST /dime/import - Execute stored procedures
   */
  static async executeProcedures(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const { procedures } = request.body as { procedures: DimeSchedulerProcedure[] };

      if (!procedures || !Array.isArray(procedures) || procedures.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Procedures array is required and must not be empty'
        });
      }

      // Validate procedure structure
      for (const procedure of procedures) {
        if (!procedure.StoredProcedureName || !procedure.ParameterNames || !procedure.ParameterValues) {
          return reply.status(400).send({
            success: false,
            message: 'Each procedure must have StoredProcedureName, ParameterNames, and ParameterValues'
          });
        }

        if (procedure.ParameterNames.length !== procedure.ParameterValues.length) {
          return reply.status(400).send({
            success: false,
            message: 'ParameterNames and ParameterValues arrays must have the same length'
          });
        }
      }

      const client = this.getClient();
      const result = await client.executeProcedures(procedures);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error executing Dime.Scheduler procedures:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error executing procedures',
        error: error.message
      });
    }
  }

  /**
   * POST /dime/job - Create a job
   */
  static async createJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const jobData = request.body as {
        sourceApp: string;
        sourceType: string;
        jobNo: string;
        shortDescription: string;
        freeDecimal4?: string;
      };

      // Validate required fields
      if (!jobData.sourceApp || !jobData.sourceType || !jobData.jobNo || !jobData.shortDescription) {
        return reply.status(400).send({
          success: false,
          message: 'sourceApp, sourceType, jobNo, and shortDescription are required'
        });
      }

      const client = this.getClient();
      const result = await client.createJob(jobData);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error creating job',
        error: error.message
      });
    }
  }

  /**
   * POST /dime/task - Create a task
   */
  static async createTask(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const taskData = request.body as {
        sourceApp: string;
        sourceType: string;
        jobNo: string;
        taskNo: string;
        shortDescription: string;
        description: string;
        useFixPlanningQty?: boolean;
      };

      // Validate required fields
      if (!taskData.sourceApp || !taskData.sourceType || !taskData.jobNo || 
          !taskData.taskNo || !taskData.shortDescription || !taskData.description) {
        return reply.status(400).send({
          success: false,
          message: 'sourceApp, sourceType, jobNo, taskNo, shortDescription, and description are required'
        });
      }

      const client = this.getClient();
      const result = await client.createTask(taskData);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error creating task',
        error: error.message
      });
    }
  }

  /**
   * POST /dime/job-with-task - Create a job with a task
   */
  static async createJobWithTask(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const { jobData, taskData } = request.body as {
        jobData: {
          sourceApp: string;
          sourceType: string;
          jobNo: string;
          shortDescription: string;
          freeDecimal4?: string;
        };
        taskData: {
          taskNo: string;
          taskShortDescription: string;
          taskDescription: string;
          useFixPlanningQty?: boolean;
        };
      };

      // Validate job data
      if (!jobData?.sourceApp || !jobData?.sourceType || !jobData?.jobNo || !jobData?.shortDescription) {
        return reply.status(400).send({
          success: false,
          message: 'jobData must include sourceApp, sourceType, jobNo, and shortDescription'
        });
      }

      // Validate task data
      if (!taskData?.taskNo || !taskData?.taskShortDescription || !taskData?.taskDescription) {
        return reply.status(400).send({
          success: false,
          message: 'taskData must include taskNo, taskShortDescription, and taskDescription'
        });
      }

      const client = this.getClient();
      const result = await client.createJobWithTask(jobData, taskData);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error creating job with task:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error creating job with task',
        error: error.message
      });
    }
  }

  /**
   * GET /dime/test - Test connection to Dime.Scheduler
   */
  static async testConnection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const client = this.getClient();
      const result = await client.testConnection();

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error testing Dime.Scheduler connection:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error testing connection',
        error: error.message
      });
    }
  }
}
