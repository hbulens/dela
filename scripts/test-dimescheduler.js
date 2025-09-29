// Test script for Dime.Scheduler endpoints
// Run this after starting the server with: node test-dime.js

const testDimeScheduler = async () => {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Test connection
    console.log('Testing Dime.Scheduler connection...');
    const connectionTest = await fetch(`${baseUrl}/dime/test`);
    const connectionResult = await connectionTest.json();
    console.log('Connection test result:', connectionResult);

    // Test 2: Create a job
    console.log('\nCreating a job...');
    const jobResponse = await fetch(`${baseUrl}/dime/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceApp: 'CRONUSBE',
        sourceType: 'CRONUSBE',
        jobNo: 'JOB002',
        shortDescription: 'Test Job from API',
        freeDecimal4: ''
      })
    });
    const jobResult = await jobResponse.json();
    console.log('Job creation result:', jobResult);

    // Test 3: Create a task
    console.log('\nCreating a task...');
    const taskResponse = await fetch(`${baseUrl}/dime/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceApp: 'CRONUSBE',
        sourceType: 'CRONUSBE',
        jobNo: 'JOB002',
        taskNo: 'TASK002001',
        shortDescription: 'Test Task',
        description: 'This is a test task created via API',
        useFixPlanningQty: true
      })
    });
    const taskResult = await taskResponse.json();
    console.log('Task creation result:', taskResult);

    // Test 4: Create job with task in one call
    console.log('\nCreating job with task...');
    const jobWithTaskResponse = await fetch(`${baseUrl}/dime/job-with-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobData: {
          sourceApp: 'CRONUSBE',
          sourceType: 'CRONUSBE',
          jobNo: 'JOB003',
          shortDescription: 'Combined Job',
          freeDecimal4: ''
        },
        taskData: {
          taskNo: 'TASK003001',
          taskShortDescription: 'Combined Task',
          taskDescription: 'This task was created with its job',
          useFixPlanningQty: true
        }
      })
    });
    const jobWithTaskResult = await jobWithTaskResponse.json();
    console.log('Job with task creation result:', jobWithTaskResult);

    // Test 5: Execute raw procedures
    console.log('\nExecuting raw procedures...');
    const proceduresResponse = await fetch(`${baseUrl}/dime/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        procedures: [
          {
            StoredProcedureName: 'mboc_upsertJob',
            ParameterNames: [
              'SourceApp',
              'SourceType',
              'JobNo',
              'ShortDescription',
              'FreeDecimal4'
            ],
            ParameterValues: [
              'CRONUSBE',
              'CRONUSBE',
              'JOB004',
              'Raw Procedure Job',
              ''
            ]
          }
        ]
      })
    });
    const proceduresResult = await proceduresResponse.json();
    console.log('Raw procedures result:', proceduresResult);

  } catch (error) {
    console.error('Error testing Dime.Scheduler:', error);
  }
};

testDimeScheduler();
