import { 
  DimeSchedulerProcedure, 
  DimeSchedulerResponse, 
  DimeSchedulerClientOptions 
} from '../types/dimeScheduler.js';

export class DimeSchedulerClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: DimeSchedulerClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.defaultHeaders = {
      'content-type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'x-api-key': this.apiKey,
      ...options.defaultHeaders
    };
  }

  /**
   * Execute stored procedures on Dime.Scheduler
   */
  async executeProcedures(procedures: DimeSchedulerProcedure[]): Promise<DimeSchedulerResponse> {
    try {
      const url = `${this.baseUrl}/import`;
      const body = JSON.stringify(procedures);

      console.log('Dime.Scheduler API request:', {
        url,
        procedureCount: procedures.length,
        procedures: procedures.map(p => p.StoredProcedureName)
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
          error: errorText
        });

        return {
          success: false,
          message: `API request failed with status ${response.status}`,
          error: errorText
        };
      }

      const result = await response.text();
      console.log('Dime.Scheduler API response:', result);

      return {
        success: true,
        message: 'Procedures executed successfully',
        data: result
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
   * Create a job using mboc_upsertJob procedure
   */
  async createJob(jobData: {
    sourceApp: string;
    sourceType: string;
    jobNo: string;
    shortDescription: string;
    freeDecimal4?: string;
  }): Promise<DimeSchedulerResponse> {
    const procedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_upsertJob',
      ParameterNames: [
        'SourceApp',
        'SourceType',
        'JobNo',
        'ShortDescription',
        'FreeDecimal4'
      ],
      ParameterValues: [
        jobData.sourceApp,
        jobData.sourceType,
        jobData.jobNo,
        jobData.shortDescription,
        jobData.freeDecimal4 || ''
      ]
    };

    return this.executeProcedures([procedure]);
  }

  /**
   * Create a task using mboc_upsertTask procedure
   */
  async createTask(taskData: {
    sourceApp: string;
    sourceType: string;
    jobNo: string;
    taskNo: string;
    shortDescription: string;
    description: string;
    useFixPlanningQty?: boolean;
  }): Promise<DimeSchedulerResponse> {
    const procedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_upsertTask',
      ParameterNames: [
        'SourceApp',
        'SourceType',
        'JobNo',
        'TaskNo',
        'ShortDescription',
        'Description',
        'UseFixPlanningQty'
      ],
      ParameterValues: [
        taskData.sourceApp,
        taskData.sourceType,
        taskData.jobNo,
        taskData.taskNo,
        taskData.shortDescription,
        taskData.description,
        taskData.useFixPlanningQty ?? true
      ]
    };

    return this.executeProcedures([procedure]);
  }

  /**
   * Create both job and task in a single API call
   */
  async createJobWithTask(jobData: {
    sourceApp: string;
    sourceType: string;
    jobNo: string;
    shortDescription: string;
    freeDecimal4?: string;
  }, taskData: {
    taskNo: string;
    taskShortDescription: string;
    taskDescription: string;
    useFixPlanningQty?: boolean;
  }): Promise<DimeSchedulerResponse> {
    const jobProcedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_upsertJob',
      ParameterNames: [
        'SourceApp',
        'SourceType',
        'JobNo',
        'ShortDescription',
        'FreeDecimal4'
      ],
      ParameterValues: [
        jobData.sourceApp,
        jobData.sourceType,
        jobData.jobNo,
        jobData.shortDescription,
        jobData.freeDecimal4 || ''
      ]
    };

    const taskProcedure: DimeSchedulerProcedure = {
      StoredProcedureName: 'mboc_upsertTask',
      ParameterNames: [
        'SourceApp',
        'SourceType',
        'JobNo',
        'TaskNo',
        'ShortDescription',
        'Description',
        'UseFixPlanningQty'
      ],
      ParameterValues: [
        jobData.sourceApp,
        jobData.sourceType,
        jobData.jobNo,
        taskData.taskNo,
        taskData.taskShortDescription,
        taskData.taskDescription,
        taskData.useFixPlanningQty ?? true
      ]
    };

    return this.executeProcedures([jobProcedure, taskProcedure]);
  }

  /**
   * Test the connection to Dime.Scheduler API
   */
  async testConnection(): Promise<DimeSchedulerResponse> {
    try {
      const url = `${this.baseUrl}/health`; // Assuming there's a health endpoint
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Connection successful',
          data: await response.text()
        };
      } else {
        return {
          success: false,
          message: `Connection failed with status ${response.status}`,
          error: await response.text()
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Connection test failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}
