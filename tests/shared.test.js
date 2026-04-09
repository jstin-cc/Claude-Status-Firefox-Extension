/**
 * Tests for src/shared.js
 *
 * shared.js uses global variables (no module exports) because it's loaded
 * as a content script. We eval it in a controlled scope to test the logic.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sharedSource = readFileSync(join(__dirname, '..', 'src', 'shared.js'), 'utf8');

// Execute shared.js in a sandboxed scope and collect its globals
function loadShared() {
  const globals = {};
  const mockDocument = {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        id: '', className: '', textContent: '',
        setAttribute() {},
      };
    },
  };

  const fn = new Function(
    'document',
    // Strip 'use strict' so we can capture top-level declarations via `this`
    sharedSource.replace(/^'use strict';?\s*/, '') +
    '\nreturn { CSM_CONFIG, STORAGE_KEYS, STATUS_COLOR, STATUS_PRIORITY, ' +
    'getOverallColor, ERROR_CODES, ERROR_LABELS, SHARED_STATUS_LABELS, csmEl };'
  );

  return fn.call(globals, mockDocument);
}

let shared;

beforeAll(() => {
  shared = loadShared();
});

// ── CSM_CONFIG ────────────────────────────────────────────

describe('CSM_CONFIG', () => {
  it('has required keys', () => {
    expect(shared.CSM_CONFIG).toHaveProperty('API_BASE');
    expect(shared.CSM_CONFIG).toHaveProperty('FETCH_TIMEOUT_MS');
    expect(shared.CSM_CONFIG).toHaveProperty('DEFAULT_POLL_MINUTES');
    expect(shared.CSM_CONFIG).toHaveProperty('MAX_BACKOFF_MINUTES');
    expect(shared.CSM_CONFIG).toHaveProperty('CACHE_MAX_AGE_MS');
  });

  it('API_BASE points to Anthropic status page', () => {
    expect(shared.CSM_CONFIG.API_BASE).toContain('status.anthropic.com');
  });

  it('FETCH_TIMEOUT_MS is a positive number', () => {
    expect(shared.CSM_CONFIG.FETCH_TIMEOUT_MS).toBeGreaterThan(0);
  });
});

// ── STORAGE_KEYS ──────────────────────────────────────────

describe('STORAGE_KEYS', () => {
  it('has all expected keys', () => {
    const keys = ['LANG', 'THEME', 'EXPANDED', 'NOTIFY', 'INTERVAL', 'CACHE'];
    for (const k of keys) {
      expect(shared.STORAGE_KEYS).toHaveProperty(k);
      expect(typeof shared.STORAGE_KEYS[k]).toBe('string');
    }
  });

  it('all values have csm- prefix', () => {
    for (const val of Object.values(shared.STORAGE_KEYS)) {
      expect(val).toMatch(/^csm-/);
    }
  });
});

// ── STATUS_COLOR ──────────────────────────────────────────

describe('STATUS_COLOR', () => {
  it('maps all five statuses', () => {
    expect(shared.STATUS_COLOR.operational).toBe('green');
    expect(shared.STATUS_COLOR.degraded_performance).toBe('yellow');
    expect(shared.STATUS_COLOR.partial_outage).toBe('orange');
    expect(shared.STATUS_COLOR.major_outage).toBe('red');
    expect(shared.STATUS_COLOR.under_maintenance).toBe('gray');
  });
});

// ── STATUS_PRIORITY ───────────────────────────────────────

describe('STATUS_PRIORITY', () => {
  it('operational has lowest priority (0)', () => {
    expect(shared.STATUS_PRIORITY.operational).toBe(0);
  });

  it('major_outage has highest priority', () => {
    const maxP = Math.max(...Object.values(shared.STATUS_PRIORITY));
    expect(shared.STATUS_PRIORITY.major_outage).toBe(maxP);
  });

  it('priorities are strictly ordered', () => {
    const { operational, under_maintenance, degraded_performance, partial_outage, major_outage } = shared.STATUS_PRIORITY;
    expect(operational).toBeLessThan(under_maintenance);
    expect(under_maintenance).toBeLessThan(degraded_performance);
    expect(degraded_performance).toBeLessThan(partial_outage);
    expect(partial_outage).toBeLessThan(major_outage);
  });
});

// ── getOverallColor ───────────────────────────────────────

describe('getOverallColor', () => {
  it('returns green for all-operational components', () => {
    const comps = [
      { name: 'API', status: 'operational' },
      { name: 'Web', status: 'operational' },
    ];
    expect(shared.getOverallColor(comps)).toBe('green');
  });

  it('returns the worst status color', () => {
    const comps = [
      { name: 'API', status: 'operational' },
      { name: 'Web', status: 'partial_outage' },
    ];
    expect(shared.getOverallColor(comps)).toBe('orange');
  });

  it('skips group-header components', () => {
    const comps = [
      { name: 'Group', status: 'major_outage', group: true },
      { name: 'API', status: 'operational' },
    ];
    expect(shared.getOverallColor(comps)).toBe('green');
  });

  it('returns green for empty array', () => {
    expect(shared.getOverallColor([])).toBe('green');
  });

  it('returns yellow for degraded_performance', () => {
    const comps = [
      { name: 'API', status: 'degraded_performance' },
      { name: 'Web', status: 'operational' },
    ];
    expect(shared.getOverallColor(comps)).toBe('yellow');
  });

  it('major_outage overrides everything', () => {
    const comps = [
      { name: 'API', status: 'degraded_performance' },
      { name: 'Web', status: 'partial_outage' },
      { name: 'DB', status: 'major_outage' },
    ];
    expect(shared.getOverallColor(comps)).toBe('red');
  });

  it('handles unknown status gracefully', () => {
    const comps = [{ name: 'X', status: 'some_new_status' }];
    const result = shared.getOverallColor(comps);
    expect(typeof result).toBe('string');
  });
});

// ── ERROR_CODES ───────────────────────────────────────────

describe('ERROR_CODES', () => {
  it('has all seven error codes', () => {
    const expected = ['TIMEOUT', 'NETWORK', 'OFFLINE', 'HTTP_4XX', 'HTTP_5XX', 'PARSE', 'UNKNOWN'];
    for (const code of expected) {
      expect(shared.ERROR_CODES).toHaveProperty(code);
      expect(shared.ERROR_CODES[code]).toBe(code);
    }
  });
});

// ── ERROR_LABELS ──────────────────────────────────────────

describe('ERROR_LABELS', () => {
  it('has labels for both languages', () => {
    expect(shared.ERROR_LABELS).toHaveProperty('de');
    expect(shared.ERROR_LABELS).toHaveProperty('en');
  });

  it('every error code has a label in both languages', () => {
    for (const code of Object.values(shared.ERROR_CODES)) {
      expect(shared.ERROR_LABELS.de[code]).toBeDefined();
      expect(shared.ERROR_LABELS.en[code]).toBeDefined();
      expect(typeof shared.ERROR_LABELS.de[code]).toBe('string');
      expect(typeof shared.ERROR_LABELS.en[code]).toBe('string');
    }
  });
});

// ── SHARED_STATUS_LABELS ──────────────────────────────────

describe('SHARED_STATUS_LABELS', () => {
  it('has both language sets', () => {
    expect(shared.SHARED_STATUS_LABELS).toHaveProperty('de');
    expect(shared.SHARED_STATUS_LABELS).toHaveProperty('en');
  });

  it('covers all STATUS_COLOR keys', () => {
    for (const status of Object.keys(shared.STATUS_COLOR)) {
      expect(shared.SHARED_STATUS_LABELS.de[status]).toBeDefined();
      expect(shared.SHARED_STATUS_LABELS.en[status]).toBeDefined();
    }
  });
});

// ── csmEl ─────────────────────────────────────────────────

describe('csmEl', () => {
  it('creates element with id when prefix is #', () => {
    const el = shared.csmEl('div', '#my-id', 'hello');
    expect(el.id).toBe('my-id');
    expect(el.textContent).toBe('hello');
  });

  it('creates element with className for plain string', () => {
    const el = shared.csmEl('span', 'my-class');
    expect(el.className).toBe('my-class');
  });

  it('creates element without classOrId when null', () => {
    const el = shared.csmEl('p', null, 'text');
    expect(el.textContent).toBe('text');
  });
});
