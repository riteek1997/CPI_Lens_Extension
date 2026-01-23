chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const handler = MESSAGE_HANDLERS[msg.type];

  if (!handler) {
    sendResponse({ ok: false, error: "Unknown message type" });
    return;
  }

  handler({ ...msg, sendResponse });
  return true; // async response
});

const MESSAGE_HANDLERS = {
  FETCH_USER: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_DEPLOYED_IFLOWS: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_FAILED_MESSAGES: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_EXPIRY_TRACKER: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_ANALYTICS_ACTIVITIES: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_DESIGNTIME_ARTIFACTS: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_ALL_PACKAGES: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_MPL_LOGS: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),

  FETCH_LAST_PROCESSED_MESSAGE: msg =>
    executeInCpiTab(msg.tenantUrl, injectedFetch, [msg.url], msg.sendResponse),
};


function executeInCpiTab(tenantUrl, func, args, sendResponse) {
  chrome.tabs.query({ url: tenantUrl }, tabs => {
    if (!tabs?.length) {
      sendResponse({ ok: false, error: "CPI tab not found" });
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func,
        args
      },
      results => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }

        const result = results?.[0]?.result;
        if (result && !result.error) {
          sendResponse({ ok: true, data: result });
        } else {
          sendResponse({ ok: false, error: result?.error || "Execution failed" });
        }
      }
    );
  });
}

function injectedFetch(apiUrl) {
  return fetch(apiUrl, {
    credentials: "include",
    headers: { Accept: "application/json" }
  })
    .then(r => r.json())
    .catch(err => ({ error: err.message }));
}