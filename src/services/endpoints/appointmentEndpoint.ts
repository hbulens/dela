import { BaseEndpoint } from './baseEndpoint.js';
import { DimeSchedulerProcedure, DimeSchedulerResponse } from '../../types/dimeScheduler.js';

/**
 * Appointment endpoint for Dime.Scheduler API
 * Handles all appointment-related operations
 */
export class AppointmentEndpoint extends BaseEndpoint {
  /**
   * Query appointments from Dime.Scheduler
   * Based on Dime.Scheduler API documentation: https://docs.dimescheduler.com/develop/api/appointment#get-appointment
   */
  async query(
    startDate: string,
    endDate: string,
    resources?: string[]
  ): Promise<DimeSchedulerResponse> {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);

    // Add resources if provided
    if (resources && resources.length > 0) {
      resources.forEach(resource => {
        params.append('resources', resource);
      });
    }

    console.log('Querying appointments:', {
      startDate,
      endDate,
      resources
    });

    return super.get('/appointment', params);
  }

  /**
   * Upsert appointment using mboc_upsertAppointment procedure
   * Based on Dime.Scheduler API documentation: https://docs.dimescheduler.com/develop/api/appointment#upsert-appointment
   */
  async upsert(appointmentData: {
    sourceApp: string;
    sourceType: string;
    jobNo: string;
    taskNo: string;
    appointmentNo?: string;
    appointmentId?: number;
    subject?: string;
    body?: string;
    start?: string; // ISO 8601 format: yyyy-mm-ddThh:mm
    end?: string; // ISO 8601 format: yyyy-mm-ddThh:mm
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
  }): Promise<DimeSchedulerResponse> {
    console.log('Creating upsert appointment procedure with data:', appointmentData);

    const procedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_upsertAppointment',
      ParameterNames: [
        'SourceApp',
        'SourceType',
        'JobNo',
        'TaskNo',
        'Subject',
        'Start',
        'End',
        'ResourceNo',
        'Category'
      ],
      ParameterValues: [
        appointmentData.sourceApp,
        appointmentData.sourceType,
        appointmentData.jobNo,
        appointmentData.taskNo,
        appointmentData.subject || '',
        this.formatDateForDimeScheduler(appointmentData.start) || '',
        this.formatDateForDimeScheduler(appointmentData.end) || '',
        appointmentData.resourceNo || '',
        appointmentData.category || ''
      ]
    };

    console.log('Generated procedure:', {
      StoredProcedureName: procedure.StoredProcedureName,
      ParameterNames: procedure.ParameterNames,
      ParameterValues: procedure.ParameterValues
    });

    return this.executeProcedures([procedure]);
  }

  /**
   * Set appointment time marker using mboc_updateAppointmentTimeMarker procedure
   * Based on Dime.Scheduler API documentation: https://docs.dimescheduler.com/develop/api/appointment#set-time-marker
   */
  async setTimeMarker(timeMarkerData: {
    appointmentId: number;
    timeMarker: string;
  }): Promise<DimeSchedulerResponse> {
    const procedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_updateAppointmentTimeMarker',
      ParameterNames: [
        'AppointmentId',
        'TimeMarker'
      ],
      ParameterValues: [
        timeMarkerData.appointmentId.toString(),
        timeMarkerData.timeMarker
      ]
    };

    console.log('Setting appointment time marker:', {
      procedure: procedure.StoredProcedureName,
      appointmentId: timeMarkerData.appointmentId,
      timeMarker: timeMarkerData.timeMarker
    });

    return this.executeProcedures([procedure]);
  }

  /**
   * Set appointment category using POST /appointmentCategory endpoint
   * Based on Dime.Scheduler API documentation
   */
  async setCategory(categoryData: {
    sourceApp?: string;
    sourceType?: string;
    appointmentId?: number;
    appointmentNo?: string;
    category: string;
    appointmentGuid?: string;
    sentFromBackOffice?: boolean;
  }): Promise<DimeSchedulerResponse> {
    try {
      const url = `${this.baseUrl}/appointmentCategory`;
      
      const body = {
        SourceApp: categoryData.sourceApp || null,
        SourceType: categoryData.sourceType || null,
        AppointmentNo: categoryData.appointmentNo || null,
        AppointmentId: categoryData.appointmentId || null,
        Category: categoryData.category,
        AppointmentGuid: categoryData.appointmentGuid || null,
        SentFromBackOffice: categoryData.sentFromBackOffice ?? true
      };

      console.log('Setting appointment category:', {
        url,
        body
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(body),
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
          message: 'Appointment category updated successfully',
          data: jsonResult
        };
      } catch (parseError) {
        // If it's not JSON, return the raw text
        return {
          success: true,
          message: 'Appointment category updated successfully',
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
