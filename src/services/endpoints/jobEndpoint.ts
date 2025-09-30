import { BaseEndpoint } from './baseEndpoint.js';
import { DimeSchedulerProcedure, DimeSchedulerResponse } from '../../types/dimeScheduler.js';

/**
 * Job endpoint for Dime.Scheduler API
 * Handles all job-related operations
 */
export class JobEndpoint extends BaseEndpoint {
  /**
   * Create or update a job using mboc_upsertJob procedure
   */
  async upsert(jobData: {
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
   * Create a job with an associated task in a single API call
   */
  async upsertWithTask(
    jobData: {
      sourceApp: string;
      sourceType: string;
      jobNo: string;
      shortDescription: string;
      freeDecimal4?: string;
    },
    taskData: {
      taskNo: string;
      taskShortDescription: string;
      taskDescription: string;
      useFixPlanningQty?: boolean;
    }
  ): Promise<DimeSchedulerResponse> {
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
}
