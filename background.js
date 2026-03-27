'use strict';

const ALARM_NAME = 'claude-status-poll';
const POLL_INTERVAL_MINUTES = 1;

// Cache last fetched data to send immediately on request
let lastData = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_INTERVAL_MINUTES });
  fetchAndBroadcast();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) fetchAndBroadcast();
});

// Content script requests current data on load
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'GET_STATUS') {
    if (lastData) {
      sendResponse({ type: 'STATUS_DATA', payload: lastData });
    } else {
      // Fetch and respond asynchronously
      fetchStatus()
        .then((data) => sendResponse({ type: 'STATUS_DATA', payload: data }))
        .catch(() => sendResponse({ type: 'STATUS_ERROR' }));
      return true; // Keep channel open for async response
    }
  }
});

async function fetchStatus() {
  const response = await fetch('https://status.anthropic.com/api/v2/components.json', {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  lastData = data;
  return data;
}

async function fetchAndBroadcast() {
  try {
    const data = await fetchStatus();
    const tabs = await chrome.tabs.query({ url: 'https://claude.ai/*' });
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type: 'STATUS_DATA', payload: data }).catch(() => {});
    }
  } catch (err) {
    const tabs = await chrome.tabs.query({ url: 'https://claude.ai/*' });
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type: 'STATUS_ERROR' }).catch(() => {});
    }
  }
}
