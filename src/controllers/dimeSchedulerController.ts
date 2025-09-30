import { FastifyRequest, FastifyReply } from 'fastify';
import { DimeSchedulerClient } from '../services/dimeSchedulerClient.js';
import { DimeSchedulerProcedure } from '../types/dimeScheduler.js';

export class DimeSchedulerController {
  private client: DimeSchedulerClient | null = null;

  constructor(baseUrl?: string, apiKey?: string) {
    if (baseUrl && apiKey) {
      this.initializeClient(baseUrl, apiKey);
    }
  }

  /**
   * Initialize the Dime.Scheduler client
   */
  initializeClient(baseUrl: string, apiKey: string): void {
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
  private getClient(): DimeSchedulerClient {
    if (!this.client) {
      throw new Error('Dime.Scheduler client not initialized. Please set DIMESCHEDULER_BASE_URL and DIMESCHEDULER_API_KEY environment variables.');
    }
    return this.client;
  }

  /**
   * POST /dimescheduler/import - Execute stored procedures
   */
  async executeProcedures(request: FastifyRequest, reply: FastifyReply) {
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
   * POST /dimescheduler/job - Create a job
   */
  async createJob(request: FastifyRequest, reply: FastifyReply) {
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
      const result = await client.jobs.upsert(jobData);

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
   * POST /dimescheduler/task - Create a task
   */
  async createTask(request: FastifyRequest, reply: FastifyReply) {
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
      const result = await client.tasks.upsert(taskData);

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
   * POST /dimescheduler/job-with-task - Create a job with a task
   */
  async createJobWithTask(request: FastifyRequest, reply: FastifyReply) {
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
      const result = await client.jobs.upsertWithTask(jobData, taskData);

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
   * POST /dimescheduler/upsert-appointment - Upsert appointment
   */
  async upsertAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const appointmentData = request.body as {
        sourceApp: string;
        sourceType: string;
        jobNo: string;
        taskNo: string;
        appointmentNo?: string;
        appointmentId?: number;
        subject?: string;
        body?: string;
        start?: string;
        end?: string;
        category?: string;
        timeMarker?: string;
        importance?: number;
        locked?: boolean;
        resourceNo?: string;
        appointmentGuid?: string;
        replaceResource?: boolean;
        sentFromBackOffice?: boolean;
        backofficeID?: string;
        backofficeParentID?: string;
        planningUOM?: string;
        planningUOMConversion?: number;
        planningQty?: number;
        useFixPlanningQty?: boolean;
        roundToUOM?: boolean;
        isManualAppointment?: boolean;
      };

      // Validate required fields
      const missingFields = [];
      if (!appointmentData.sourceApp) missingFields.push('sourceApp');
      if (!appointmentData.sourceType) missingFields.push('sourceType');
      if (!appointmentData.jobNo) missingFields.push('jobNo');
      if (!appointmentData.taskNo) missingFields.push('taskNo');

      if (missingFields.length > 0) {
        console.error('Missing required fields for upsert appointment:', {
          missingFields,
          receivedData: appointmentData
        });
        return reply.status(400).send({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
          receivedData: appointmentData
        });
      }

      console.log('Validated appointment data for upsert:', appointmentData);

      const client = this.getClient();
      const result = await client.appointments.upsert(appointmentData);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error upserting appointment:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error upserting appointment',
        error: error.message
      });
    }
  }

  /**
   * POST /dimescheduler/appointment-category - Set appointment category
   */
  async setAppointmentCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(400).send({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }

      const categoryData = request.body as {
        sourceApp?: string;
        sourceType?: string;
        appointmentNo?: string;
        category: string;
      };

      // Validate required fields
      if (!categoryData.category) {
        return reply.status(400).send({
          success: false,
          message: 'category is required'
        });
      }

      // At least one appointment identifier must be provided
      if (!categoryData.appointmentNo) {
        return reply.status(400).send({
          success: false,
          message: 'At least one appointment identifier (appointmentId, appointmentNo, or appointmentGuid) is required'
        });
      }

      const client = this.getClient();
      const result = await client.appointments.setCategory(categoryData);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error setting appointment category:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error setting appointment category',
        error: error.message
      });
    }
  }

  /**
   * GET /dimescheduler/appointments - Query appointments
   */
  async getAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, resources } = request.query as {
        startDate?: string;
        endDate?: string;
        resources?: string | string[];
      };

      // Validate required parameters
      if (!startDate || !endDate) {
        return reply.status(400).send({
          success: false,
          message: 'startDate and endDate query parameters are required'
        });
      }

      // Normalize resources to array
      let resourcesArray: string[] | undefined;
      if (resources) {
        resourcesArray = Array.isArray(resources) ? resources : [resources];
      }

      console.log('Querying appointments:', {
        startDate,
        endDate,
        resources: resourcesArray
      });

      const client = this.getClient();
      const result = await client.appointments.query(startDate, endDate, resourcesArray);

      if (result.success) {
        return reply.send(result);
      } else {
        return reply.status(500).send(result);
      }
    } catch (error: any) {
      console.error('Error querying appointments:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error querying appointments',
        error: error.message
      });
    }
  }

  /**
   * POST /dimescheduler/set-category-for-drager-appointments - Query and update categories for SICK/AFWEZIGHEID appointments
   */
  async setCategoryForDragerAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, resources } = request.query as {
        startDate?: string;
        endDate?: string;
        resources?: string | string[];
      };

      // Validate required parameters
      if (!startDate || !endDate) {
        return reply.status(400).send({
          success: false,
          message: 'startDate and endDate query parameters are required'
        });
      }

      // Normalize resources to array
      let resourcesArray: string[] | undefined;
      if (resources) {
        resourcesArray = Array.isArray(resources) ? resources : [resources];
      }

      console.log('Querying appointments for Drager category update:', {
        startDate,
        endDate,
        resources: resourcesArray
      });

      const client = this.getClient();

      // Step 1: Query appointments
      const queryResult = await client.appointments.query(startDate, endDate, resourcesArray);

      if (!queryResult.success) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to query appointments',
          error: queryResult.error
        });
      }

      // Step 2: Filter appointments for task.taskNo = "SICK" and task.job.jobNo = "AFWEZIGHEID"
      const appointments = Array.isArray(queryResult.data) ? queryResult.data : [];
      const matchingAppointments = appointments.filter((apt: any) => {
        return apt.task?.job?.jobNo?.startsWith('PB');
      });

      console.log(`Found ${matchingAppointments.length} matching appointments out of ${appointments.length} total`);

      if (matchingAppointments.length === 0) {
        return reply.send({
          success: true,
          message: 'No matching appointments found',
          data: {
            totalAppointments: appointments.length,
            matchingAppointments: 0,
            updated: 0
          }
        });
      }

      // Step 3: Update category for each matching appointment
      const updateResults = [];
      let successCount = 0;
      let failureCount = 0;

      for (const appointment of matchingAppointments) {
        try {
          // Handle different property name cases (id, Id, appointmentId)
          const aptId = appointment.id || appointment.appointmentId || appointment.Id;
          const aptNo = appointment.appointmentNo || appointment.AppointmentNo;
          const aptGuid = appointment.appointmentGuid || appointment.AppointmentGuid;
          
          console.log(`Updating appointment ${aptNo || aptId} (ID: ${aptId}) to category GEREED`);

          const updateResult = await client.appointments.setCategory({
            appointmentId: aptId,
            appointmentNo: aptNo,
            appointmentGuid: aptGuid,
            category: 'GEREED',
            sentFromBackOffice: true
          });

          if (updateResult.success) {
            successCount++;
            updateResults.push({
              appointmentId: aptId,
              appointmentNo: aptNo,
              status: 'success'
            });
          } else {
            failureCount++;
            updateResults.push({
              appointmentId: aptId,
              appointmentNo: aptNo,
              status: 'failed',
              error: updateResult.error
            });
          }
        } catch (error: any) {
          const aptId = appointment.id || appointment.appointmentId || appointment.Id;
          const aptNo = appointment.appointmentNo || appointment.AppointmentNo;
          failureCount++;
          updateResults.push({
            appointmentId: aptId,
            appointmentNo: aptNo,
            status: 'failed',
            error: error.message
          });
        }
      }

      return reply.send({
        success: true,
        message: `Updated ${successCount} of ${matchingAppointments.length} matching appointments`,
        data: {
          totalAppointments: appointments.length,
          matchingAppointments: matchingAppointments.length,
          successCount,
          failureCount,
          results: updateResults
        }
      });

    } catch (error: any) {
      console.error('Error in setCategoryForDragerAppointments:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error processing Drager appointments',
        error: error.message
      });
    }
  }

  /**
   * POST /dimescheduler/set-timemarker-for-drager-appointments - Query and update time markers for SICK/AFWEZIGHEID appointments
   */
  async setTimeMarkerForDragerAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, resources, timeMarker } = request.query as {
        startDate?: string;
        endDate?: string;
        resources?: string | string[];
        timeMarker?: string;
      };

      // Validate required parameters
      if (!startDate || !endDate) {
        return reply.status(400).send({
          success: false,
          message: 'startDate and endDate query parameters are required'
        });
      }

      if (!timeMarker) {
        return reply.status(400).send({
          success: false,
          message: 'timeMarker query parameter is required'
        });
      }

      // Normalize resources to array
      let resourcesArray: string[] | undefined;
      if (resources) {
        resourcesArray = Array.isArray(resources) ? resources : [resources];
      }

      console.log('Querying appointments for Drager time marker update:', {
        startDate,
        endDate,
        resources: resourcesArray,
        timeMarker
      });

      const client = this.getClient();

      // Step 1: Query appointments
      const queryResult = await client.appointments.query(startDate, endDate, resourcesArray);

      if (!queryResult.success) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to query appointments',
          error: queryResult.error
        });
      }

      // Step 2: Filter appointments for task.taskNo = "SICK" and task.job.jobNo = "AFWEZIGHEID"
      const appointments = Array.isArray(queryResult.data) ? queryResult.data : [];
      const matchingAppointments = appointments.filter((apt: any) => {
        return apt.task?.job?.jobNo?.startsWith('PB');
      });

      console.log(`Found ${matchingAppointments.length} matching appointments out of ${appointments.length} total`);

      if (matchingAppointments.length === 0) {
        return reply.send({
          success: true,
          message: 'No matching appointments found',
          data: {
            totalAppointments: appointments.length,
            matchingAppointments: 0,
            updated: 0
          }
        });
      }

      // Step 3: Update time marker for each matching appointment
      const updateResults = [];
      let successCount = 0;
      let failureCount = 0;

      for (const appointment of matchingAppointments) {
        try {
          // Handle different property name cases (id, Id, appointmentId)
          const aptId = appointment.id || appointment.appointmentId || appointment.Id;
          const aptNo = appointment.appointmentNo || appointment.AppointmentNo;
          
          if (!aptId) {
            throw new Error('Appointment ID not found in appointment object');
          }
          
          console.log(`Updating appointment ${aptNo || aptId} (ID: ${aptId}) to time marker ${timeMarker}`);

          const updateResult = await client.appointments.setTimeMarker({
            appointmentId: aptId,
            timeMarker: timeMarker
          });

          if (updateResult.success) {
            successCount++;
            updateResults.push({
              appointmentId: aptId,
              appointmentNo: aptNo,
              status: 'success'
            });
          } else {
            failureCount++;
            updateResults.push({
              appointmentId: aptId,
              appointmentNo: aptNo,
              status: 'failed',
              error: updateResult.error
            });
          }
        } catch (error: any) {
          const aptId = appointment.appointmentId || appointment.Id;
          const aptNo = appointment.appointmentNo || appointment.AppointmentNo;
          failureCount++;
          updateResults.push({
            appointmentId: aptId,
            appointmentNo: aptNo,
            status: 'failed',
            error: error.message
          });
        }
      }

      return reply.send({
        success: true,
        message: `Updated ${successCount} of ${matchingAppointments.length} matching appointments to time marker ${timeMarker}`,
        data: {
          totalAppointments: appointments.length,
          matchingAppointments: matchingAppointments.length,
          successCount,
          failureCount,
          timeMarker,
          results: updateResults
        }
      });

    } catch (error: any) {
      console.error('Error in setTimeMarkerForDragerAppointments:', error);
      return reply.status(500).send({
        success: false,
        message: 'Error processing Drager appointments time marker update',
        error: error.message
      });
    }
  }

  /**
   * GET /dimescheduler/test - Test connection to Dime.Scheduler
   */
  async testConnection(request: FastifyRequest, reply: FastifyReply) {
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
