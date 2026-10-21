import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import { escapeRegex, buildSearchKey } from './task-manager-api/cache/taskCache.js';
import {
  AI_FALLBACK_MESSAGE,
  buildDescriptionPrompt,
  extractDescription,
  generateTaskDescription
} from './task-manager-api/services/aiService.js';
import { validateGenerateDescription } from './task-manager-api/middleware/validationMiddleware.js';
import aiRoutes from './task-manager-api/routes/aiRoutes.js';

describe('cache utilities', () => {
  it('should escape special regex characters', () => {
    const result = escapeRegex('.*+?');
    assert.strictEqual(result, '\\.\\*\\+\\?');
  });

  it('should build search key in lowercase', () => {
    const key = buildSearchKey('  SEARCHTERM  ');
    assert.strictEqual(key, 'tasks:search:searchterm');
  });

  it('should handle empty input safely', () => {
    assert.strictEqual(buildSearchKey('   '), 'tasks:search:');
    assert.strictEqual(escapeRegex(''), '');
  });
});

// ─── Practical 13: AI API Integration ─────────────────────────────────────────

const createMockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const runValidation = (body) => {
  const req = { body };
  const res = createMockRes();
  let nextCalled = false;
  validateGenerateDescription(req, res, () => {
    nextCalled = true;
  });
  return { req, res, nextCalled };
};

describe('AI request validation (validateGenerateDescription)', () => {
  it('should return 400 when title is missing', () => {
    const { res, nextCalled } = runValidation({});
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.deepStrictEqual(res.body.details, ['Task title is required.']);
  });

  it('should return 400 when title is an empty or whitespace string', () => {
    for (const title of ['', '   ']) {
      const { res, nextCalled } = runValidation({ title });
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
    }
  });

  it('should return 400 when title is not a string', () => {
    const { res, nextCalled } = runValidation({ title: 42 });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.details[0], 'Task title must be a string.');
  });

  it('should accept a valid title, trim it and call next()', () => {
    const { req, res, nextCalled } = runValidation({ title: '  Complete React project  ' });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.body, null);
    assert.strictEqual(req.body.title, 'Complete React project');
  });
});

describe('AI prompt building and response parsing', () => {
  it('should include the task title in the prompt', () => {
    const messages = buildDescriptionPrompt('Complete React project');
    assert.strictEqual(messages.length, 2);
    assert.ok(messages[1].content.includes('Complete React project'));
    assert.strictEqual(messages[0].role, 'system');
  });

  it('should normalise whitespace around the model output', () => {
    assert.strictEqual(
      extractDescription('  Develop   the\nproject.  '),
      'Develop the project.'
    );
  });

  it('should return an empty string for invalid responses', () => {
    assert.strictEqual(extractDescription(undefined), '');
    assert.strictEqual(extractDescription(null), '');
    assert.strictEqual(extractDescription(123), '');
    assert.strictEqual(extractDescription('   '), '');
  });
});

describe('AI service fallback when no API key is configured', () => {
  it('should never throw and return a friendly fallback response', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = '';
    try {
      const result = await generateTaskDescription('Complete React project');
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.description, '');
      assert.strictEqual(result.message, AI_FALLBACK_MESSAGE);
    } finally {
      if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = originalKey;
    }
  });
});

describe('POST /api/ai/generate-description endpoint', () => {
  let server;
  let baseUrl;
  let mockAi;
  const originalEnv = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL
  };

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/ai', aiRoutes);
    server = await new Promise((resolve) => {
      const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    // Mock OpenAI-compatible server so the happy path runs without a real key
    mockAi = http.createServer((req, res) => {
      req.on('data', () => {});
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            id: 'cmpl-mock',
            object: 'chat.completion',
            created: 0,
            model: 'gpt-4o-mini',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content:
                    ' Develop and finalize the React project by implementing the required features and testing the application. '
                },
                finish_reason: 'stop'
              }
            ]
          })
        );
      });
    });
    await new Promise((resolve) => mockAi.listen(0, '127.0.0.1', resolve));
  });

  after(async () => {
    if (mockAi) await new Promise((resolve) => mockAi.close(resolve));
    if (server) await new Promise((resolve) => server.close(resolve));
    if (originalEnv.OPENAI_API_KEY === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
    if (originalEnv.OPENAI_BASE_URL === undefined) delete process.env.OPENAI_BASE_URL;
    else process.env.OPENAI_BASE_URL = originalEnv.OPENAI_BASE_URL;
  });

  it('should return 400 for an empty title (Test Case 2)', async () => {
    const response = await fetch(`${baseUrl}/api/ai/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' })
    });
    const body = await response.json();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.details[0], 'Task title is required.');
  });

  it('should return the friendly fallback when the AI service is unreachable (Test Case 3)', async () => {
    process.env.OPENAI_API_KEY = 'dummy-key';
    process.env.OPENAI_BASE_URL = 'http://127.0.0.1:9/v1'; // closed port -> network error
    try {
      const response = await fetch(`${baseUrl}/api/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Complete React project' })
      });
      const body = await response.json();
      assert.strictEqual(response.status, 503);
      assert.deepStrictEqual(body, {
        success: false,
        description: '',
        message: AI_FALLBACK_MESSAGE
      });
    } finally {
      delete process.env.OPENAI_BASE_URL;
    }
  });

  it('should return only a clean description and no API key (Test Cases 1 & 5)', async () => {
    process.env.OPENAI_API_KEY = 'dummy-key-never-exposed';
    process.env.OPENAI_BASE_URL = `http://127.0.0.1:${mockAi.address().port}/v1`;
    try {
      const response = await fetch(`${baseUrl}/api/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Complete React project' })
      });
      const body = await response.json();
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(Object.keys(body).sort(), ['description', 'success']);
      assert.strictEqual(body.success, true);
      assert.strictEqual(
        body.description,
        'Develop and finalize the React project by implementing the required features and testing the application.'
      );
      const raw = JSON.stringify(body);
      assert.ok(!raw.includes('dummy-key-never-exposed'), 'API key must never be returned');
      assert.ok(!raw.includes('choices'), 'raw AI response must not be forwarded');
      assert.ok(!raw.includes('Bearer'), 'authorization headers must not be forwarded');
    } finally {
      delete process.env.OPENAI_BASE_URL;
    }
  });
});
