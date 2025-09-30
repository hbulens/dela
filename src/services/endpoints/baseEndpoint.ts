import {
  DimeSchedulerProcedure,
  DimeSchedulerResponse
} from '../../types/dimeScheduler.js';

/**
 * Base class for Dime.Scheduler API endpoints
 * Provides shared HTTP functionality for all endpoint classes
 */
export abstract class BaseEndpoint {
  protected baseUrl: string;
  protected timeout: number;
  protected defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string,
    timeout: number,
    defaultHeaders: Record<string, string>
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.defaultHeaders = defaultHeaders;
  }

  /**
   * Format date for Dime.Scheduler API
   * Convert ISO date string to format expected by Dime.Scheduler
   */
  protected formatDateForDimeScheduler(dateString?: string): string | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;

      // Keep the original timezone and format as YYYY-MM-DD HH:MM:SS
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.warn('Failed to format date:', dateString, error);
      return null;
    }
  }

  /**
   * Execute stored procedures on Dime.Scheduler
   */
  protected async executeProcedures(procedures: DimeSchedulerProcedure[]): Promise<DimeSchedulerResponse> {
    try {
      const url = `${this.baseUrl}/import`;
      const body = JSON.stringify(procedures);

      console.log('Dime.Scheduler API request:', {
        url,
        procedureCount: procedures.length,
        procedures: procedures.map(p => p.StoredProcedureName),
        requestBody: body
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body,
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dime.Scheduler API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: url,
          requestBody: body,
          headers: this.defaultHeaders
        });

        return {
          success: false,
          message: `API request failed with status ${response.status}: ${errorText || response.statusText}`,
          error: errorText,
          status: response.status,
          statusText: response.statusText
        };
      }

      const result = await response.text();
      console.log('Dime.Scheduler API response:', result);

      // Check if the response contains error information
      // Dime.Scheduler can return 200 but with error content
      let success = true;
      let errorMessage = null;

      try {
        // Try to parse as JSON to check for error indicators
        const jsonResult = JSON.parse(result);

        // Check for common error indicators in the response
        if (jsonResult.error || jsonResult.errors || jsonResult.message?.toLowerCase().includes('error')) {
          success = false;
          errorMessage = jsonResult.error || jsonResult.errors || jsonResult.message;
          console.error('Dime.Scheduler API returned error in response body:', {
            success: false,
            error: errorMessage,
            fullResponse: result
          });
        }
      } catch (parseError) {
        // If it's not JSON, check for error patterns in the text
        const lowerResult = result.toLowerCase();
        if (lowerResult.includes('error') || lowerResult.includes('exception') || lowerResult.includes('failed')) {
          success = false;
          errorMessage = result;
          console.error('Dime.Scheduler API returned error in response text:', {
            success: false,
            error: errorMessage
          });
        }
      }

      return {
        success,
        message: success ? 'Procedures executed successfully' : 'Procedure execution failed',
        data: result,
        error: errorMessage
      };

    } catch (error: any) {
      console.error('Dime.Scheduler API request failed:', error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout',
          error: 'Request exceeded timeout limit'
        };
      }

      return {
        success: false,
        message: 'Request failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Make a GET request to the Dime.Scheduler API
   */
  protected async get(endpoint: string, params?: URLSearchParams): Promise<DimeSchedulerResponse> {
    try {
      const queryString = params ? `?${params.toString()}` : '';
      const url = `${this.baseUrl}${endpoint}${queryString}`;

      console.log('Dime.Scheduler API GET request:', { url });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dime.Scheduler API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: url
        });

        return {
          success: false,
          message: `API request failed with status ${response.status}: ${errorText || response.statusText}`,
          error: errorText,
          status: response.status,
          statusText: response.statusText
        };
      }

      const result = await response.text();
      console.log('Dime.Scheduler API response:', result);

      // Try to parse the result as JSON
      try {
        const jsonResult = JSON.parse(result);
        return {
          success: true,
          message: 'Request successful',
          data: jsonResult
        };
      } catch (parseError) {
        // If it's not JSON, return the raw text
        return {
          success: true,
          message: 'Request successful',
          data: result
        };
      }

    } catch (error: any) {
      console.error('Dime.Scheduler API request failed:', error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout',
          error: 'Request exceeded timeout limit'
        };
      }

      return {
        success: false,
        message: 'Request failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}
