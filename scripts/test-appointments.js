/**
 * Test script for querying appointments from Dime.Scheduler
 * Run with: node scripts/test-appointments.js
 */

// Example using the new endpoint-based API
async function testAppointmentsQuery() {
  const baseUrl = process.env.DIMESCHEDULER_BASE_URL || 'https://your-dimescheduler-url';
  const apiKey = process.env.DIMESCHEDULER_API_KEY || 'your-api-key';

  console.log('Testing Dime.Scheduler Appointments Query...');
  console.log('Base URL:', baseUrl);
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('---');

  // Build query parameters
  const startDate = '2025-09-01T00:00:00';
  const endDate = '2025-09-30T23:59:59';
  const resources = ['RESOURCE001', 'RESOURCE002'];

  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  resources.forEach(resource => params.append('resources', resource));

  const url = `${baseUrl}/appointment?${params.toString()}`;

  console.log('Request URL:', url);
  console.log('Query Parameters:', {
    startDate,
    endDate,
    resources
  });
  console.log('---');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'x-api-key': apiKey
      }
    });

    console.log('Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log('Response is not JSON');
      }
    } else {
      console.error('Request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAppointmentsQuery();
