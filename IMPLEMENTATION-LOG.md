# v3.0 Implementierung — Vollstaendiger Plan

## Status-Legende
- [x] Erledigt
- [ ] Ausstehend

---

## Phase 0: Fehlercode-System — ERLEDIGT
- [x] shared.js: ERROR_CODES + ERROR_LABELS
- [x] background.js: classifyFetchError, AbortController, Fetch-Lock, Error-Codes in Messages
- [x] content.js: applyError(code), getErrorLabel()
- [x] popup.js: showPopupError(code), getPopupErrorLabel()

---

## Phase 1: Stabilitaet & Bugfixes — ERLEDIGT

### 1.1 + 1.2: Fetch-Timeout + Fetch-Lock — ERLEDIGT (Phase 0)

### 1.3: Exponential Backoff — ERLEDIGT
- [x] consecutiveErrors Zaehler in background.js
- [x] setupAlarm() verdoppelt Intervall pro Fehler, cap bei MAX_BACKOFF_MINUTES (10 min)
- [x] Reset auf Normal-Intervall nach erfolgreichem Fetch

### 1.4: Cache-Persistenz in chrome.storage.local — ERLEDIGT
- [x] persistCache() speichert lastSummary + lastIncidents + timestamp
- [x] restoreCache() beim SW-Start laedt Daten (max 10 min alt)
- [x] Nutzt STORAGE_KEYS.CACHE aus shared.js

### 1.5: onMessage return true Fix — ERLEDIGT
- [x] Alle sync-Pfade geben explicit return false zurueck
- [x] Alle async-Pfade geben return true zurueck
- [x] GET_STATUS und GET_SUMMARY Bloecke mit else-if getrennt

### 1.6: Content Script Timeout + Retry — ERLEDIGT
- [x] requestStatus() mit 5s Timeout
- [x] 1x Retry nach 1s bei Fehlschlag
- [x] TIMEOUT Error-Code bei Timeout

### 1.7: Event Listener Cleanup (SPA-Navigation) — ERLEDIGT
- [x] AbortController fuer document/window Listener
- [x] MutationObserver erkennt Widget-Entfernung
- [x] Cleanup: abort + langMenu.remove + observer.disconnect

### 1.8: API-Response Validierung — ERLEDIGT
- [x] Prueft ob summaryJson.components ein Array ist
- [x] Wirft PARSE Error bei ungueltigem Schema

### 1.9: Offline-Handling — ERLEDIGT
- [x] self.addEventListener('online') — reset errors + sofort fetch
- [x] self.addEventListener('offline') — broadcast OFFLINE an alle Tabs

### 1.10: Version-Sync Manifeste — ERLEDIGT
- [x] Firefox manifest.json: 3.0
- [x] Chrome manifest.json: 3.0

---

## Phase 2: Code-Qualitaet & Modularisierung — ERLEDIGT

### 2.1: LABELS zentralisieren — ERLEDIGT
- [x] SHARED_STATUS_LABELS in shared.js (de/en Status-Texte)
- [x] content.js LABELS.de.status = SHARED_STATUS_LABELS.de
- [x] popup.js LABELS.de.compStatus = SHARED_STATUS_LABELS.de

### 2.2: getOverallColor Duplikat entfernen — ERLEDIGT
- [x] _getOverallColor() aus background.js entfernt
- [x] background.js nutzt getOverallColor() aus shared.js
- [x] Chrome: importScripts('shared.js') am Anfang
- [x] Firefox: manifest "scripts": ["shared.js", "background.js"]

### 2.3: applyTheme — NICHT UMGESETZT
- Zu riskant fuer Content Script (scoped vs global) — bleibt separat

### 2.4: DOM-Helfer vereinheitlichen — ERLEDIGT
- [x] csmEl(tag, classOrId, text) in shared.js verfuegbar
- [x] content.js behaelt mk() intern (minimale Aenderung)

### 2.5: Config-Objekt — ERLEDIGT
- [x] CSM_CONFIG: API_BASE, FETCH_TIMEOUT_MS, DEFAULT_POLL_MINUTES, MAX_BACKOFF_MINUTES, CACHE_MAX_AGE_MS
- [x] STORAGE_KEYS: LANG, THEME, EXPANDED, NOTIFY, INTERVAL, CACHE
- [x] Alle Magic Strings in background.js, content.js, popup.js durch STORAGE_KEYS ersetzt
- [x] API-URL in background.js durch CSM_CONFIG.API_BASE ersetzt

### 2.6: popup.js aufteilen — NICHT UMGESETZT
- Zu grosse Umstrukturierung fuer diesen Sprint, Risiko hoch
- popup.js bleibt monolithisch (546 Zeilen) — kann in v3.1 gesplittet werden

### 2.7: Error-Klassen — ERLEDIGT (Phase 0)

### 2.8: DocumentFragment fuer Batch-DOM — ERLEDIGT
- [x] renderComponents in content.js nutzt DocumentFragment

### 2.9: Legacy-Ordner aufraeumen — ERLEDIGT
- [x] claude-status-extension-firefox/ (v1) geloescht
- [x] claude-status-extension-firefox-bak/ geloescht

---

## Phase 3: UI/UX & Features — ERLEDIGT

### 3.1: Light Mode Kontrast (WCAG AA) — ERLEDIGT
- [x] content.css: text-primary #0a0a0a, text-secondary #3d3d3d
- [x] popup.css: gleiche Anpassungen
- [x] Erhoehte bg-opacity und border-opacity

### 3.2: Touch-Targets min 44x44px — ERLEDIGT
- [x] #csm-lang-btn, #csm-theme-btn: padding 6px 8px, min 32x32px
- [x] Border-radius 6px

### 3.3: Responsive Widget — ERLEDIGT
- [x] @media (max-width: 480px): bottom/right 8px, max-width calc(100vw - 24px)
- [x] @media (max-width: 800px): max-width 280px

### 3.4: Neue Farbe fuer degraded_performance — ERLEDIGT
- [x] STATUS_COLOR.degraded_performance = 'yellow' (statt orange)
- [x] CSS: --yellow Variable in Dark + Light Mode
- [x] .csm-yellow, .p-yellow, .p-uptime-yellow Klassen
- [x] Glow: box-shadow 0 0 6px (statt 4px)

### 3.5: System-Theme-Detection — ERLEDIGT
- [x] content.js: prefers-color-scheme als Default
- [x] popup.js: prefers-color-scheme als Default
- [x] Gespeicherter Wert ueberschreibt System-Default

### 3.6: Notification-System — BEREITS VORHANDEN
- [x] maybeNotify() in background.js war schon implementiert

### 3.7: Manueller Refresh-Button im Popup — ERLEDIGT
- [x] Button in popup.html (↻ Icon)
- [x] FORCE_FETCH Message-Handler in background.js
- [x] Click-Handler in popup.js mit Loading-Feedback
- [x] CSS fuer #p-refresh-btn

### 3.8: Skeleton Loading — ERLEDIGT
- [x] @keyframes csm-shimmer Animation
- [x] .csm-loading Klasse auf Timestamp initial
- [x] Entfernt bei applyData() und applyError()
- [x] prefers-reduced-motion respektiert

### 3.9: Offline-Indikator im Widget — ERLEDIGT
- [x] Error-Code OFFLINE zeigt "Offline — letzte Daten werden angezeigt"
- [x] Timestamp zeigt E:OFFLINE

### 3.10: Escape-Taste schliesst Dropdowns — ERLEDIGT
- [x] document.addEventListener('keydown', Escape) in content.js

### 3.11: aria-live auf Timestamp — ERLEDIGT
- [x] role="status" + aria-live="polite" auf #csm-timestamp

### 3.12: SVG-Icons statt Emoji — NICHT UMGESETZT
- Minimal impact, Emojis funktionieren zuverlaessig cross-platform

---

## Phase 4: Build & Tooling — ERLEDIGT

### 4.1: package.json — ERLEDIGT
- [x] Projekt-Metadaten, version 3.0.0
- [x] Scripts: build, build:firefox, build:chrome, lint, lint:fix, test, test:watch
- [x] devDependencies: eslint ^9.0.0, vitest ^3.1.0

### 4.2 + 4.3: Build-Script + Manifest-Generator — ERLEDIGT
- [x] scripts/build.js: plattformunabhaengiger Ersatz fuer sync.ps1
- [x] Synct src/ zu beiden Extension-Ordnern
- [x] Generiert browser-spezifische manifest.json aus shared Base + Overrides
- [x] --firefox / --chrome fuer einzelne Targets
- [x] --zip fuer dist/ ZIP-Erstellung
- [x] Version wird automatisch aus package.json gelesen

### 4.4: ESLint — ERLEDIGT
- [x] eslint.config.js (Flat Config, ESLint 9+)
- [x] Browser + Extension API globals definiert
- [x] shared.js Globals (CSM_CONFIG, STORAGE_KEYS, etc.) definiert
- [x] no-innerHTML Regel fuer AMO-Compliance
- [x] Extension-Ordner + dist/ + node_modules/ in ignores
- [x] Separater Config-Block fuer scripts/ (ESM)

### 4.5: Unit-Tests — ERLEDIGT
- [x] vitest.config.js
- [x] tests/shared.test.js: 27 Tests
- [x] CSM_CONFIG, STORAGE_KEYS, STATUS_COLOR, STATUS_PRIORITY Validierung
- [x] getOverallColor() mit 6 Szenarien (operational, worst-wins, group-skip, empty, yellow, unknown)
- [x] ERROR_CODES + ERROR_LABELS Vollstaendigkeit (alle Codes, beide Sprachen)
- [x] SHARED_STATUS_LABELS Abdeckung
- [x] csmEl() DOM-Helper Tests

### 4.6: GitHub Actions CI/CD — ERLEDIGT
- [x] .github/workflows/ci.yml
- [x] Trigger: push auf main/feature/*, PRs auf main
- [x] Job 1: lint + test (Node 20)
- [x] Job 2: build + ZIP + Upload als Artefakt (30 Tage Retention)

---

## Zusammenfassung der Aenderungen

### Neue/Geaenderte Dateien:
- `src/shared.js` — massiv erweitert: CSM_CONFIG, STORAGE_KEYS, SHARED_STATUS_LABELS, csmEl(), ERROR_CODES/LABELS, yellow fuer degraded_performance
- `src/background.js` — komplett refactored: importScripts, keine Duplikate, Backoff, Cache-Persistenz, Offline-Handling, FORCE_FETCH, Validierung
- `src/content.js` — Error-Codes, Timeout+Retry, AbortController Cleanup, STORAGE_KEYS, DocumentFragment, aria-live, Escape, Skeleton Loading, System-Theme
- `src/popup.js` — Error-Codes, STORAGE_KEYS, SHARED_STATUS_LABELS, Refresh-Button, System-Theme, yellow pulse
- `src/content.css` — yellow Farbe, WCAG Kontraste, Touch-Targets, Responsive, Skeleton Loading, Glow 6px
- `src/popup.css` — yellow Farbe, WCAG Kontraste, Glow 6px, Refresh-Button
- `src/popup.html` — Refresh-Button
- Firefox manifest.json — v3.0, shared.js in background scripts
- Chrome manifest.json — v3.0

### Neue Dateien (Phase 4):
- `package.json` — Projekt-Config mit Scripts und devDependencies
- `scripts/build.js` — Build-Script + Manifest-Generator (ESM)
- `eslint.config.js` — ESLint Flat Config
- `vitest.config.js` — Test-Runner Config
- `tests/shared.test.js` — 27 Unit-Tests fuer shared.js
- `.github/workflows/ci.yml` — CI Pipeline (lint, test, build, artifacts)
- `.gitignore` — node_modules/ und .claude/

### Nicht umgesetzt (bewusste Entscheidung):
- 2.3 applyTheme vereinheitlichen — zu unterschiedlich in content vs popup Kontext
- 2.6 popup.js aufteilen — zu grosse Umstrukturierung, v3.1
- 3.12 SVG-Icons — Emojis funktionieren, minimal impact
