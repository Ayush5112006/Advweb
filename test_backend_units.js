import { describe, it } from 'node:test';
import assert from 'node:assert';
import { escapeRegex, buildSearchKey } from './task-manager-api/cache/taskCache.js';

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
