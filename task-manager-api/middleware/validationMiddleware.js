// ─── Server-Side Input Validation ─────────────────────────────────────────────
// Hand-rolled validators (no external validation library) that collect every
// field-level problem and report them together in a single structured response.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const isBlank = (value) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const isNonString = (value) => typeof value !== 'string';

const fail = (res, details) =>
  res.status(400).json({
    error: 'Validation Error',
    message: 'Input validation failed for the request payload.',
    details
  });

/**
 * POST /register - name, email, password
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body ?? {};
  const errors = [];

  if (isBlank(name)) {
    errors.push('Name is required.');
  } else if (isNonString(name)) {
    errors.push('Name must be a string.');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) errors.push('Name must be at least 2 characters long.');
    if (trimmedName.length > 50) errors.push('Name must be at most 50 characters long.');
  }

  if (isBlank(email)) {
    errors.push('Email is required.');
  } else if (isNonString(email)) {
    errors.push('Email must be a string.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (isBlank(password)) {
    errors.push('Password is required.');
  } else if (isNonString(password)) {
    errors.push('Password must be a string.');
  } else {
    if (password.length < 6) errors.push('Password must be at least 6 characters long.');
    if (password.length > 72) {
      // bcrypt silently truncates anything beyond 72 bytes
      errors.push('Password must be at most 72 characters long.');
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one letter and one number.');
    }
  }

  if (errors.length) return fail(res, errors);

  // Normalise before the controller runs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * POST /login - email, password
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};
  const errors = [];

  if (isBlank(email)) {
    errors.push('Email is required.');
  } else if (isNonString(email)) {
    errors.push('Email must be a string.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (isBlank(password)) {
    errors.push('Password is required.');
  } else if (isNonString(password)) {
    errors.push('Password must be a string.');
  }

  if (errors.length) return fail(res, errors);

  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * POST /tasks - title is required, priority must be a known enum value
 */
export const validateCreateTask = (req, res, next) => {
  const { title, description, completed, priority } = req.body ?? {};
  const errors = [];

  if (isBlank(title)) {
    errors.push('Task title is required.');
  } else if (isNonString(title)) {
    errors.push('Task title must be a string.');
  } else {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) errors.push('Task title must be at least 3 characters long.');
    if (trimmedTitle.length > 200) errors.push('Task title must be at most 200 characters long.');
  }

  if (description !== undefined && description !== null) {
    if (isNonString(description)) {
      errors.push('Task description must be a string.');
    } else if (description.length > 1000) {
      errors.push('Task description must be at most 1000 characters long.');
    }
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Task completed must be a boolean value.');
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (errors.length) return fail(res, errors);

  next();
};

/**
 * PUT /tasks/:id - at least one updatable field must be supplied
 */
export const validateUpdateTask = (req, res, next) => {
  const { title, description, completed, priority } = req.body ?? {};
  const errors = [];
  const updateFields = ['title', 'description', 'completed', 'priority'].filter(
    (field) => req.body?.[field] !== undefined
  );

  if (updateFields.length === 0) {
    errors.push('At least one of title, description, completed or priority must be provided.');
  }

  if (title !== undefined) {
    if (isNonString(title)) {
      errors.push('Task title must be a string.');
    } else {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 3) errors.push('Task title must be at least 3 characters long.');
      if (trimmedTitle.length > 200) errors.push('Task title must be at most 200 characters long.');
    }
  }

  if (description !== undefined && isNonString(description)) {
    errors.push('Task description must be a string.');
  } else if (typeof description === 'string' && description.length > 1000) {
    errors.push('Task description must be at most 1000 characters long.');
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push('Task completed must be a boolean value.');
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Invalid priority. Allowed values: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (errors.length) return fail(res, errors);

  next();
};
