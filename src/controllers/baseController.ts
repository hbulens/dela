import { FastifyRequest, FastifyReply } from 'fastify';

export abstract class BaseController {
  /**
   * Common validation for JSON content type
   */
  protected validateContentType(request: FastifyRequest, reply: FastifyReply): boolean {
    const contentType = request.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      reply.status(400).send({
        success: false,
        message: 'Content-Type must be application/json'
      });
      return false;
    }
    return true;
  }

  /**
   * Common validation for request body
   */
  protected validateRequestBody(request: FastifyRequest, reply: FastifyReply): any | null {
    const body = request.body as any;
    if (!body || typeof body !== 'object') {
      reply.status(400).send({
        success: false,
        message: 'Request body must be a valid JSON object'
      });
      return null;
    }
    return body;
  }

  /**
   * Common method to process webhook data
   */
  protected async processRequestData(
    type: string,
    body: any,
    successMessage: string,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Log the incoming data for debugging
      console.log(`${type} webhook received:`, body);

      // Return success response
      reply.send({
        success: true,
        message: successMessage,
        data: body
      });
    } catch (error) {
      console.error(`Error processing ${type} webhook:`, error);
      reply.status(500).send({
        success: false,
        message: `Error processing ${type} webhook`
      });
    }
  }


  /**
   * Handle common webhook processing with validation
   */
  protected async handleRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    type: string,
    successMessage: string
  ): Promise<void> {
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

      // Process the webhook data
      await this.processRequestData(type, body, successMessage, reply);
    } catch (error) {
      console.error(`Error handling ${type} webhook request:`, error);
      reply.status(500).send({
        success: false,
        message: `Error handling ${type} webhook request`
      });
    }
  }
}
