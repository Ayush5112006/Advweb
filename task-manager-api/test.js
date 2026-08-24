import http from 'http';

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('--- STARTING PRACTICAL 5 MONGOOSE & API TESTS ---');
  console.log('====================================================');

  let createdTaskId = null;
  const dummyNonExistentId = '507f1f77bcf86cd799439011';

  try {
    // Test 1: GET /tasks (all tasks)
    console.log('\n[Test 1] GET /tasks');
    const t1 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/tasks',
      method: 'GET'
    });
    console.log('Status Code:', t1.statusCode);
    console.log('Response Body:', JSON.stringify(t1.body, null, 2));

    // Test 2: POST /tasks (Valid payload with un-trimmed title & priority)
    console.log('\n[Test 2] POST /tasks (Valid Payload with title trimming & priority)');
    const t2Payload = JSON.stringify({
      title: '   MongoDB & Mongoose Practical Task   ',
      description: 'Test pre-save hook trimming and enum validation',
      completed: false,
      priority: 'high'
    });
    const t2 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t2Payload)
      }
    }, t2Payload);
    console.log('Status Code:', t2.statusCode);
    console.log('Response Body:', JSON.stringify(t2.body, null, 2));
    if (t2.body && t2.body._id) {
      createdTaskId = t2.body._id;
    }

    // Test 3: POST /tasks (Missing Title -> Schema Validation Error)
    console.log('\n[Test 3] POST /tasks (Validation Failure: Missing Title)');
    const t3Payload = JSON.stringify({
      description: 'Missing title task',
      priority: 'low'
    });
    const t3 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t3Payload)
      }
    }, t3Payload);
    console.log('Status Code:', t3.statusCode);
    console.log('Structured Validation Error Response:', JSON.stringify(t3.body, null, 2));

    // Test 4: POST /tasks (Invalid Priority Enum -> Validation Error)
    console.log('\n[Test 4] POST /tasks (Validation Failure: Invalid Priority Enum)');
    const t4Payload = JSON.stringify({
      title: 'Enum Test Task',
      priority: 'super-urgent'
    });
    const t4 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t4Payload)
      }
    }, t4Payload);
    console.log('Status Code:', t4.statusCode);
    console.log('Structured Enum Error Response:', JSON.stringify(t4.body, null, 2));

    // Test 5: GET /tasks/:id (Retrieve Single Task)
    if (createdTaskId) {
      console.log(`\n[Test 5] GET /tasks/${createdTaskId} (Retrieve Created Task)`);
      const t5 = await request({
        hostname: '127.0.0.1',
        port: 5050,
        path: `/tasks/${createdTaskId}`,
        method: 'GET'
      });
      console.log('Status Code:', t5.statusCode);
      console.log('Response Body:', JSON.stringify(t5.body, null, 2));
    }

    // Test 6: GET /tasks/:id (404 Non-existent ObjectId)
    console.log(`\n[Test 6] GET /tasks/${dummyNonExistentId} (Non-existent Task 404 handling)`);
    const t6 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: `/tasks/${dummyNonExistentId}`,
      method: 'GET'
    });
    console.log('Status Code:', t6.statusCode);
    console.log('404 JSON Response:', JSON.stringify(t6.body, null, 2));

    // Test 7: GET /tasks/invalid-id-format (400 Bad Request)
    console.log('\n[Test 7] GET /tasks/invalid-id-123 (Invalid ObjectId format)');
    const t7 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/tasks/invalid-id-123',
      method: 'GET'
    });
    console.log('Status Code:', t7.statusCode);
    console.log('400 Bad Request Response:', JSON.stringify(t7.body, null, 2));

    // Test 8: PUT /tasks/:id (Update Task)
    if (createdTaskId) {
      console.log(`\n[Test 8] PUT /tasks/${createdTaskId} (Update Task)`);
      const t8Payload = JSON.stringify({
        completed: true,
        priority: 'medium'
      });
      const t8 = await request({
        hostname: '127.0.0.1',
        port: 5050,
        path: `/tasks/${createdTaskId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(t8Payload)
        }
      }, t8Payload);
      console.log('Status Code:', t8.statusCode);
      console.log('Updated Task Response:', JSON.stringify(t8.body, null, 2));
    }

    // Test 9: DELETE /tasks/:id (Delete Task)
    if (createdTaskId) {
      console.log(`\n[Test 9] DELETE /tasks/${createdTaskId}`);
      const t9 = await request({
        hostname: '127.0.0.1',
        port: 5050,
        path: `/tasks/${createdTaskId}`,
        method: 'DELETE'
      });
      console.log('Status Code:', t9.statusCode);
      console.log('Deleted Task Response:', JSON.stringify(t9.body, null, 2));
    }

    // Test 10: GET /tasks/:id (Verify Deletion 404)
    if (createdTaskId) {
      console.log(`\n[Test 10] GET /tasks/${createdTaskId} (Verify Deletion 404)`);
      const t10 = await request({
        hostname: '127.0.0.1',
        port: 5050,
        path: `/tasks/${createdTaskId}`,
        method: 'GET'
      });
      console.log('Status Code:', t10.statusCode);
      console.log('Deletion Verification 404 Response:', JSON.stringify(t10.body, null, 2));
    }

    // Test 11: GET /non-existent-endpoint (404 route handler)
    console.log('\n[Test 11] GET /non-existent-endpoint (Undefined Route 404)');
    const t11 = await request({
      hostname: '127.0.0.1',
      port: 5050,
      path: '/non-existent-endpoint',
      method: 'GET'
    });
    console.log('Status Code:', t11.statusCode);
    console.log('404 Route Response:', JSON.stringify(t11.body, null, 2));

  } catch (err) {
    console.error('Test Execution Failed:', err);
  }

  console.log('\n====================================================');
  console.log('--- PRACTICAL 5 API TESTS COMPLETED ---');
  console.log('====================================================');
}

runTests();
