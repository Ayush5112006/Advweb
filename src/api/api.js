const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

/**
 * Helper function to handle API response and extract error messages
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    if (data) {
      if (data.details && Array.isArray(data.details)) {
        errorMessage = data.details.join(' ');
      } else if (data.message) {
        errorMessage = data.message;
      }
    }
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Retrieve all tasks (supports title search query)
 */
export async function getTasks(search = '') {
  const url = search
    ? `${BASE_URL}/tasks?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/tasks`;
  
  const response = await fetch(url);
  return handleResponse(response);
}

/**
 * Retrieve a single task by ObjectId
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`);
  return handleResponse(response);
}

/**
 * Create a new task (POST /tasks)
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Update an existing task (PUT /tasks/:id)
 */
export async function updateTask(id, taskData) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Delete a task (DELETE /tasks/:id)
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}
