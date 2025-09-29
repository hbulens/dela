export interface DimeSchedulerParameter {
  name: string;
  value: string | number | boolean;
}

export interface DimeSchedulerProcedure {
  StoredProcedureName: string;
  ParameterNames: string[];
  ParameterValues: (string | number | boolean)[];
}

export interface DimeSchedulerRequest {
  procedures: DimeSchedulerProcedure[];
}

export interface DimeSchedulerResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface DimeSchedulerConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface DimeSchedulerClientOptions {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}
