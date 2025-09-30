import { BaseEndpoint } from './baseEndpoint.js';
import { DimeSchedulerProcedure, DimeSchedulerResponse } from '../../types/dimeScheduler.js';

/**
 * Task endpoint for Dime.Scheduler API
 * Handles all task-related operations
 */
export class TaskEndpoint extends BaseEndpoint {
  /**
   * Create or update a task using mboc_upsertTask procedure
   */
  async upsert(taskData: {
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
}
