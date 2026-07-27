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
  console.log('--- STARTING REST API TESTS ---');

  try {
    // 1. GET /tasks (all tasks)
    console.log('\nTest 1: GET /tasks');
    const t1 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'GET'
    });
    console.log('Status:', t1.statusCode);
    console.log('Body:', t1.body);

    // 2. GET /tasks/1 (retrieve single task)
    console.log('\nTest 2: GET /tasks/1');
    const t2 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks/1',
      method: 'GET'
    });
    console.log('Status:', t2.statusCode);
    console.log('Body:', t2.body);

    // 3. POST /tasks (create task with correct headers)
    console.log('\nTest 3: POST /tasks (Valid payload)');
    const t3Payload = JSON.stringify({ title: 'New Test Task', completed: false });
    const t3 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t3Payload)
      }
    }, t3Payload);
    console.log('Status:', t3.statusCode);
    console.log('Body:', t3.body);

    // 4. POST /tasks without Content-Type: application/json
    console.log('\nTest 4: POST /tasks (Missing Content-Type)');
    const t4Payload = JSON.stringify({ title: 'Invalid Header Task' });
    const t4 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Length': Buffer.byteLength(t4Payload)
      }
    }, t4Payload);
    console.log('Status:', t4.statusCode);
    console.log('Body:', t4.body);

    // 5. POST /tasks with simulated error
    console.log('\nTest 5: POST /tasks (Error Simulation)');
    const t5Payload = JSON.stringify({ title: 'trigger-error' });
    const t5 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t5Payload)
      }
    }, t5Payload);
    console.log('Status:', t5.statusCode);
    console.log('Body:', t5.body);

    // 6. PUT /tasks/2 (update task)
    console.log('\nTest 6: PUT /tasks/2 (Update completed to true)');
    const t6Payload = JSON.stringify({ completed: true });
    const t6 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks/2',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(t6Payload)
      }
    }, t6Payload);
    console.log('Status:', t6.statusCode);
    console.log('Body:', t6.body);

    // 7. DELETE /tasks/3 (delete task)
    console.log('\nTest 7: DELETE /tasks/3');
    const t7 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks/3',
      method: 'DELETE'
    });
    console.log('Status:', t7.statusCode);
    console.log('Body:', t7.body);

    // 8. GET /tasks/3 (verify deletion)
    console.log('\nTest 8: GET /tasks/3 (Verify deletion)');
    const t8 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/tasks/3',
      method: 'GET'
    });
    console.log('Status:', t8.statusCode);
    console.log('Body:', t8.body);

    // 9. GET /undefined-route (404 handler)
    console.log('\nTest 9: GET /undefined-route (404 handler)');
    const t9 = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/undefined-route',
      method: 'GET'
    });
    console.log('Status:', t9.statusCode);
    console.log('Body:', t9.body);

  } catch (err) {
    console.error('Test run failed:', err);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
