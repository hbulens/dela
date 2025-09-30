import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './baseController.js';
import { getDimeSchedulerController } from '../config/dimeSchedulerConfig.js';

export class AbsenceController extends BaseController {
  constructor() {
    super();
  }

  /**
   * POST /createAbsence - Create absence by calling upsert appointment
   */
  async createAbsence(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Validate content type
      if (!this.validateContentType(request, reply)) {
        return;
      }

      // Validate request body
      const body = this.validateRequestBody(request, reply);
      if (!body) {
        return;
      }

      // Extract required fields for upsert appointment
      const { resourceNo, jobNo, taskNo, startDate, endDate, subject } = body;

      // Validate required fields
      if (!resourceNo || !jobNo || !taskNo || !startDate || !endDate || !subject) {
        return reply.status(400).send({
          success: false,
          message: 'resourceNo, jobNo, taskNo, startDate, endDate, and subject are required'
        });
      }

      // Log the incoming data for debugging
      console.log('createAbsence webhook received:', body);

      // Call Dime.Scheduler upsert appointment
      let dimeschedulerSuccess = false;
      let dimeschedulerError = null;
      
      try {
        const appointmentData = {
          sourceApp: body.sourceApp || 'DEFAULT_APP',
          sourceType: body.sourceType || 'ABSENCE',
          jobNo,
          taskNo,
          resourceNo,
          start: startDate,
          end: endDate,
          subject,
          body: body.description || subject,
          category: body.category || 'ABSENCE',
          isManualAppointment: true,
          sentFromBackOffice: true
        };

        console.log('Prepared appointment data for Dime.Scheduler:', appointmentData);

        // Get the global Dime.Scheduler controller and call the upsert appointment endpoint
        const dimeSchedulerController = getDimeSchedulerController();
        if (dimeSchedulerController) {
          // Create a mock reply object that captures the response
          let responseData: any = null;
          const mockReply = {
            send: (data: any) => {
              responseData = data;
              if (data.success === false) {
                dimeschedulerSuccess = false;
                dimeschedulerError = data.message || data.error || 'Unknown Dime.Scheduler error';
              } else {
                dimeschedulerSuccess = true;
              }
              return mockReply;
            },
            status: (code: number) => mockReply
          };

          await dimeSchedulerController.upsertAppointment(
            { body: appointmentData, headers: request.headers } as FastifyRequest,
            mockReply as any
          );

          console.log('Dime.Scheduler response:', responseData);
        } else {
          console.warn('Dime.Scheduler controller not initialized, skipping appointment creation');
          dimeschedulerError = 'Dime.Scheduler controller not initialized';
        }

        if (dimeschedulerSuccess) {
          console.log('Successfully created absence appointment in Dime.Scheduler');
        } else {
          console.error('Failed to create absence appointment in Dime.Scheduler:', dimeschedulerError);
        }
      } catch (error) {
        console.error('Error calling Dime.Scheduler upsert appointment:', error);
        dimeschedulerError = error;
        console.log('Webhook data stored successfully, but Dime.Scheduler call failed');
      }

      // Send single response with both webhook and Dime.Scheduler results
      const responseMessage = dimeschedulerSuccess 
        ? 'Absence created successfully and appointment added to Dime.Scheduler'
        : dimeschedulerError 
          ? 'Absence data stored successfully, but Dime.Scheduler call failed'
          : 'Absence created successfully';

      reply.send({
        success: true,
        message: responseMessage,
        data: body,
        dimescheduler: {
          success: dimeschedulerSuccess,
          error: dimeschedulerError
        }
      });

    } catch (error) {
      console.error('Error handling createAbsence webhook request:', error);
      reply.status(500).send({
        success: false,
        message: 'Error handling createAbsence webhook request'
      });
    }
  }
}
