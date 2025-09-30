import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './baseController.js';

export class AppointmentController extends BaseController {
  /**
   * POST /addWarningToAppointment - Add warning to appointment
   */
  async addWarningToAppointment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.handleRequest(
      request,
      reply,
      'addWarningToAppointment',
      'Warning added to appointment successfully'
    );
  }

  /**
   * POST /updateCategoryOfAppointment - Update category of appointment
   */
  async updateCategoryOfAppointment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.handleRequest(
      request,
      reply,
      'updateCategoryOfAppointment',
      'Appointment category updated successfully'
    );
  }
}
