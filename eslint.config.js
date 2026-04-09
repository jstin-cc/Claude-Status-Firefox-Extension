export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        MutationObserver: 'readonly',
        URL: 'readonly',
        self: 'readonly',
        // Extension APIs
        chrome: 'readonly',
        browser: 'readonly',
        importScripts: 'readonly',
        // shared.js globals (loaded before other scripts)
        CSM_CONFIG: 'readonly',
        STORAGE_KEYS: 'readonly',
        STATUS_COLOR: 'readonly',
        STATUS_PRIORITY: 'readonly',
        ERROR_CODES: 'readonly',
        ERROR_LABELS: 'readonly',
        SHARED_STATUS_LABELS: 'readonly',
        getOverallColor: 'readonly',
        csmEl: 'readonly',
      },
    },
    rules: {
      // Errors
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-redeclare': 'error',
      'no-duplicate-case': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',
      'no-debugger': 'error',

      // Best practices
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-with': 'error',
      'no-caller': 'error',
      'no-throw-literal': 'error',

      // DOM safety (AMO compliance)
      'no-restricted-properties': ['error',
        { object: 'document', property: 'write', message: 'Use DOM API methods instead.' },
        { property: 'innerHTML', message: 'Use textContent or DOM API for AMO compliance.' },
        { property: 'outerHTML', message: 'Use DOM API methods instead.' },
      ],

      // Style (warn only)
      'no-var': 'warn',
      'prefer-const': ['warn', { destructuring: 'all' }],
    },
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      'claude-status-extension-firefox-v2/**',
      'claude-status-extension-chrome-v2/**',
      'dist/**',
      'node_modules/**',
    ],
  },
];
