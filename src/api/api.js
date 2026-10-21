const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const TOKEN_KEY = 'taskmanager_token';
const USER_KEY = 'taskmanager_user';

/**
 * Read the stored JWT. Kept in localStorage so a page refresh keeps the session.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Build request headers, attaching the Bearer token when one is available.
 * Notifies subscribers when the server rejects the stored token.
 */
function buildHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

const notifyUnauthorized = () => {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
};

/**
 * Helper function to handle API response and extract error messages
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (response.status === 401) {
    clearSession();
    notifyUnauthorized();
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
 * Register a new account (POST /register)
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(response);
}

/**
 * Authenticate and receive a JWT (POST /login)
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(response);
  storeSession(data.token, data.user);
  return data;
}

/**
 * Retrieve all tasks (supports title search query)
 */
export async function getTasks(search = '') {
  const url = search
    ? `${BASE_URL}/tasks?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/tasks`;

  const response = await fetch(url, { headers: buildHeaders() });
  return handleResponse(response);
}

/**
 * Retrieve a single task by ObjectId
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, { headers: buildHeaders() });
  return handleResponse(response);
}

/**
 * Create a new task (POST /tasks)
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
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
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Delete a task (DELETE /tasks/:id)
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: buildHeaders()
  });
  return handleResponse(response);
}

/**
 * Generate a task description with AI (POST /api/ai/generate-description)
 *
 * Practical 13: the browser only ever talks to our own Express backend, which
 * calls OpenAI server-side. No API key is present in frontend code or in any
 * request sent from the browser.
 *
 * Returns the plain description string, or throws a user-friendly Error when
 * validation fails or the AI service is unavailable.
 */
export async function generateTaskDescription(title) {
  const response = await fetch(`${BASE_URL}/api/ai/generate-description`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title })
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.success) {
    const message =
      data?.message ||
      (Array.isArray(data?.details) && data.details.join(' ')) ||
      'AI description generation is currently unavailable. Please enter the description manually.';
    throw new Error(message);
  }

  if (typeof data.description !== 'string' || !data.description.trim()) {
    throw new Error('The AI returned an empty description. Please try again or type it manually.');
  }

  return data.description.trim();
}
