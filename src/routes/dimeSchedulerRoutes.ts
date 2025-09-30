import { FastifyInstance } from 'fastify';
import { getDimeSchedulerController } from '../config/dimeSchedulerConfig.js';
import { AppointmentController } from '../controllers/appointmentController.js';
import { AbsenceController } from '../controllers/absenceController.js';

export async function dimeSchedulerRoutes(fastify: FastifyInstance) {
  // POST /dimescheduler/import - Execute stored procedures
  fastify.post('/dimescheduler/import', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.executeProcedures(request, reply);
  });

  // GET /dimescheduler/test - Test connection to Dime.Scheduler
  fastify.get('/dimescheduler/test', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.testConnection(request, reply);
  });

  // POST /dimescheduler/upsert-appointment - Upsert appointment
  fastify.post('/dimescheduler/upsert-appointment', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.upsertAppointment(request, reply);
  });

  // POST /dimescheduler/appointment-category - Set appointment category
  fastify.post('/dimescheduler/appointment-category', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.setAppointmentCategory(request, reply);
  });

  // GET /dimescheduler/appointments - Query appointments
  fastify.get('/dimescheduler/appointments', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.getAppointments(request, reply);
  });

  // POST /dimescheduler/set-category-for-drager-appointments - Query and update categories for SICK/AFWEZIGHEID appointments
  fastify.post('/dimescheduler/set-category-for-drager-appointments', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.setCategoryForDragerAppointments(request, reply);
  });

  // POST /dimescheduler/set-timemarker-for-drager-appointments - Query and update time markers for SICK/AFWEZIGHEID appointments
  fastify.post('/dimescheduler/set-timemarker-for-drager-appointments', async (request, reply) => {
    const controller = getDimeSchedulerController();
    if (!controller) {
      return reply.status(503).send({
        success: false,
        message: 'Dime.Scheduler client not initialized'
      });
    }
    return controller.setTimeMarkerForDragerAppointments(request, reply);
  });

  // POST /addWarningToAppointment - Add warning to appointment
  fastify.post('/addWarningToAppointment', async (request, reply) => {
    const controller = new AppointmentController();
    return controller.addWarningToAppointment(request, reply);
  });

  // POST /updateCategoryOfAppointment - Update category of appointment
  fastify.post('/updateCategoryOfAppointment', async (request, reply) => {
    const controller = new AppointmentController();
    return controller.updateCategoryOfAppointment(request, reply);
  });

  // POST /createAbsence - Create absence
  fastify.post('/createAbsence', async (request, reply) => {
    const controller = new AbsenceController();
    return controller.createAbsence(request, reply);
  });
}
