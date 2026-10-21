import OpenAI from 'openai';

// User-facing fallback reused by the route whenever AI generation fails
export const AI_FALLBACK_MESSAGE =
  'AI description generation is currently unavailable. Please enter the description manually.';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 15000;

// Values copied from .env.example by mistake are treated as "no key configured"
const PLACEHOLDER_KEYS = new Set(['', 'your_openai_api_key_here', 'your_key_here']);

/**
 * The API key must only ever exist inside the backend process.
 * Returns null when it is missing/placeholder so callers can fall back safely.
 */
export function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (typeof key !== 'string' || PLACEHOLDER_KEYS.has(key.trim())) return null;
  return key.trim();
}

/**
 * Clear, single-purpose prompt: one concise, useful paragraph for the task title.
 */
export function buildDescriptionPrompt(title) {
  return [
    {
      role: 'system',
      content:
        'You are a project-management assistant that writes task descriptions. ' +
        'Reply with the description only: one concise paragraph of 1-3 sentences (max 60 words), ' +
        'plain text, no markdown, no bullet points, no quotation marks, no preamble.'
    },
    {
      role: 'user',
      content: `Write a concise, useful task description for the following task title:\n\n"${title}"`
    }
  ];
}

/**
 * Extract a clean description from a model response.
 * Returns '' when the response is missing or contains no usable text.
 */
export function extractDescription(content) {
  if (typeof content !== 'string') return '';
  return content.replace(/\s+/g, ' ').trim();
}

function createClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const timeout = Number(process.env.OPENAI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  return new OpenAI({
    apiKey,
    // Optional self-hosted/proxy endpoint - never contains credentials
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
    timeout,
    maxRetries: 1
  });
}

/**
 * Generate a task description from a title.
 * Never throws - always resolves to { success, description, message }.
 */
export async function generateTaskDescription(title) {
  const fallback = { success: false, description: '', message: AI_FALLBACK_MESSAGE };

  try {
    const client = createClient();
    if (!client) {
      console.warn('[AI] OPENAI_API_KEY is not configured - returning fallback response.');
      return fallback;
    }

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: buildDescriptionPrompt(title),
      temperature: 0.4,
      max_tokens: 200
    });

    const description = extractDescription(completion?.choices?.[0]?.message?.content);
    if (!description) {
      console.warn('[AI] Model returned an empty or invalid response - returning fallback.');
      return fallback;
    }

    return { success: true, description, message: '' };
  } catch (err) {
    // Log name + message only: never the error object, headers or the API key
    const reason = err?.name || 'Error';
    const detail = typeof err?.message === 'string' ? err.message.slice(0, 200) : 'unknown error';
    console.error(`[AI] Description generation failed (${reason}): ${detail}`);
    return fallback;
  }
}
