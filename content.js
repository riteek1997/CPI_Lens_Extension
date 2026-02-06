
(function () {
  if (document.getElementById("cpi-lens-fab")) return;

  /* Floating Button */
  const fab = document.createElement("div");
  fab.id = "cpi-lens-fab";
  const logoImg = document.createElement("img");
  logoImg.src = chrome.runtime.getURL("assets/logo.png");
  logoImg.alt = "CPI Lens";
  logoImg.style.width = "35px";
  logoImg.style.height = "35px";
  logoImg.style.borderRadius = "50%";
  logoImg.style.objectFit = "cover";
  fab.appendChild(logoImg);

  Object.assign(fab.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#284478",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  });

  fab.onmouseenter = () => {
    fab.style.transform = "scale(1.08)";
    fab.style.boxShadow = "0 10px 26px rgba(0,0,0,0.35)";
  };

  fab.onmouseleave = () => {
    fab.style.transform = "scale(1)";
    fab.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
  };

  document.body.appendChild(fab);

  /* Click → open overlay */
  fab.onclick = () => openCpiLensOverlay();

})();

(function injectFavorite() {
  const BTN_ID = "cpi-favorite-toggle";
  const STORAGE_PREFIX = "__CPI_LENS_FAVOURITES__";

  function getTenant() {
      const host = window.location.hostname;
      const parts = host.split(".");
      let tenant = parts[0] || "Unknown";
      return tenant;
  }

  function getStorageKey() {
    return `${STORAGE_PREFIX}::${getTenant()}`;
  }

  function getFavorites(callback) {
    const key = getStorageKey();
    chrome.storage.local.get([key], result => {
      callback(result[key] || []);
    });
  }

  function saveFavorites(favs) {
    const key = getStorageKey();
    chrome.storage.local.set({ [key]: favs }, () => {
      console.log("[CPI Favorites] Saved:", favs);
    });
  }

  function isFavorite(uniqueId, callback) {
    getFavorites(favs => {
      callback(favs.some(f => f.id === uniqueId));
    });
  }

  function toggleFavorite(favObj, btn) {
    getFavorites(favs => {
      const index = favs.findIndex(f => f.id === favObj.id);

      if (index >= 0) {
        favs.splice(index, 1);
        btn.textContent = "☆";
        btn.title = "Add to Favorites";
      } else {
        favs.push(favObj);
        btn.textContent = "⭐";
        btn.title = "Remove from Favorites";
      }

      saveFavorites(favs);
    });
  }

  function createButton(favObj) {
    const btn = document.createElement("span");
    btn.id = BTN_ID;

    btn.style.cssText = `
      margin-left: 8px;
      cursor: pointer;
      font-size: 18px;
      vertical-align: middle;
      user-select: none;
    `;

    isFavorite(favObj.id, isFav => {
      btn.textContent = isFav ? "⭐" : "☆";
      btn.title = isFav ? "Remove from Favorites" : "Add to Favorites";
    });

    btn.onclick = () => toggleFavorite(favObj, btn);
    return btn;
  }

  function inject() {
    if (document.getElementById(BTN_ID)) return;

    const titleSpan = document.querySelector(
      '[id$="--iflowObjectPageHeader-innerTitle"]'
    );
    if (!titleSpan) return;

    const name = titleSpan.innerText.trim();
    const url = location.href;

    const favObj = {
      id: url,
      name,
      url
    };

    titleSpan.insertAdjacentElement("afterend", createButton(favObj));
  }

  const observer = new MutationObserver(() => inject());
  observer.observe(document.body, { childList: true, subtree: true });
})();

(function injectExcelExportButton() {

  async function injectDeployedIFlowList() {
      
      const ACTIONS_ID = "PanelArtifactsTitle";
    
      const actionsContainer = document.getElementById(ACTIONS_ID);
      if (!actionsContainer) return;
    
      // Avoid duplicates
      if (actionsContainer.querySelector("#cpiLens_DeployedIflowListExport")) return;
    
      const btn = document.createElement("button");
      btn.id = "cpiLens_DeployedIflowListExport";
      btn.className =
      "sapMBtn sapMBtnBase sapMBtnTransparent sapUxAPObjectPageHeaderActionButton";
      btn.title = "Export iFlows to Excel";
      btn.setAttribute("aria-label", "Export artifacts to Excel");
      btn.innerHTML = `
        <span class="sapMBtnInner">
          <span class="sapMBtnIcon sapUiIcon sapUiIconMirrorInRTL" style="display: flex; align-items: center;">
            <img src="${chrome.runtime.getURL('assets/xls.png')}" alt="Export to Excel" style="width:20px; height:20px; display:block;" />
          </span>
        </span>
      `;
    
      btn.onclick = () => {
    
        function downloadIFlowList(IFlowList){
        // Prepare the data rows
        const headers = ["Id", "Version", "Name", "Type", "DeployedBy", "DeployedOn", "Status"];
       
        function formatSapDate(sapDate) {
          if (!sapDate) return "";
          // Try ISO first
          if (!/^\/Date\(/.test(sapDate)) {
            let parsed = new Date(sapDate);
            if (!isNaN(parsed)) return (
              parsed.getFullYear() + "-" +
              String(parsed.getMonth() + 1).padStart(2, "0") + "-" +
              String(parsed.getDate()).padStart(2, "0") + " " +
              String(parsed.getHours()).padStart(2, "0") + ":" +
              String(parsed.getMinutes()).padStart(2, "0") + ":" +
              String(parsed.getSeconds()).padStart(2, "0")
            );
          }
          const m = sapDate.match(/^\/Date\((\d+)\)\/$/);
          if (m && m[1]) {
            const date = new Date(Number(m[1]));
            return (
              date.getFullYear() + "-" +
              String(date.getMonth() + 1).padStart(2, "0") + "-" +
              String(date.getDate()).padStart(2, "0") + " " +
              String(date.getHours()).padStart(2, "0") + ":" +
              String(date.getMinutes()).padStart(2, "0") + ":" +
              String(date.getSeconds()).padStart(2, "0")
            );
          }
          return "";
        }
    
        const rows = [headers].concat(
          (IFlowList || []).map(obj => [
            obj.Id || "",
            obj.Version || "",
            obj.Name || "",
            obj.Type || "",
            obj.DeployedBy || "",
            formatSapDate(obj.DeployedOn),
            obj.Status || "",
          ])
        );
    
        // Convert to CSV
        function toCsv(arr) {
          return arr.map(row =>
            row.map(item =>
              ('"' + String(item).replace(/"/g, '""') + '"')
            ).join(",")
          ).join("\r\n");
        }
    
        const csvData = toCsv(rows);
    
        // Trigger download
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DeployedArtifacts_CloudIntegration.xlsx.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        }
    
        try {
          const currentUrl = window.location.href;
          const tenantUrl = new URL(currentUrl);
          const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;
    
          const deployedApiUrl =
            `${baseUrl}/api/v1/IntegrationRuntimeArtifacts`
            + `?$select=Id,Version,Name,Type,DeployedBy,DeployedOn,Status`;
    
          chrome.runtime.sendMessage(
            {
              type: "FETCH_DEPLOYED_IFLOWS",
              url: deployedApiUrl,
              tenantUrl: currentUrl
            },
            async (response) => {
              if (!response?.ok) {
                showToast("Failed to fetch deployed iFlows. Please refresh your page and try again!");
                return;
              }
    
              const iFlowsList = response.data?.d?.results || [];
              downloadIFlowList(iFlowsList);
            }
          );
        } catch (err) {
          console.log(err.message)
          showToast("Failed to fetch deployed iFlows. Please refresh your page and try again!");
        }
    
      };
    
      actionsContainer.appendChild(btn);
  }

  const observer = new MutationObserver(() => {
    injectDeployedIFlowList();
   });
  observer.observe(document.body, { childList: true, subtree: true });

})();

function openCpiLensOverlay() {
  if (document.getElementById("cpi-lens-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "cpi-lens-overlay";

  overlay.innerHTML = `
      <div class="cpi-lens-app">
        
        <!-- HEADER -->
        <header class="cpi-lens-header">
          <div class="logo">
          <img id="cpillenslogo" alt="CPI Lens Logo" style="width:45px; height:40px; border-radius:50%; object-fit:cover; margin-right:10px;" />
          </div>
          <div class="title">CPI Lens</div>

          <div class="header-center" id="tenantInfo">
           <span class="info-item"> Tenant: <b id="tenantName">-</b> <span id="envBadge" class="env-badge env-unknown">UNKNOWN</span> </span>
           <span class="divider">|</span>
           <span class="info-item">Region: <b id="regionName">-</b></span>
           <span class="divider">|</span>
           <span class="info-item">User: <b id="userName">-</b></span>
          </div>
          <div class="header-actions">
            <label class="theme-switch">
              <input type="checkbox" id="cpi-theme-toggle">
              <span class="slider"></span>
            </label>
          <button class="close-btn">✕</button>
         </div>
        </header>
  
        <!-- MAIN -->
        <div class="cpi-lens-main">
          
          <!-- SIDE NAV -->
          <nav class="cpi-lens-sidebar">
            <button data-tab="activities" class="active">📊 Activities</button>
            <button data-tab="trends" >📈 Trends</button>
            <button data-tab="favourites">⭐ Favorites</button>
            <button data-tab="failures">❌  Failures</button>
             <button data-tab="ghosted">👻 Ghosted Artifacts</button>
            <button data-tab="expiry">⏳ Expiry Tracker</button>
            <button data-tab="idle">💤 Idle iFlows</button>
            <button data-tab="duplicates">🔁 Duplicates & Tests</button>
            <button data-tab="tools">🛠️ Tools</button>
            <button data-tab="help">📖 Help</button>
            <button data-tab="about">ℹ️ About</button>
          </nav>
  
          <!-- CONTENT -->
          <section class="cpi-lens-content">

            <div class="tab-content active" id="activities">
              <h2>Activities</h2>
              <p>Execution trends.</p>
            </div>

            <div class="tab-content" id="trends">
              <h2>Trends</h2>
              <p>Execution trends.</p>
            </div>

             <div class="tab-content" id="favourites">
              <h2>Favourite IFlows</h2>
              <p>Mark Iflows as Favourites to access them quickly next time.</p>
            </div>
  
            <div class="tab-content" id="ghosted">
              <h2>Ghosted Artifacts</h2>
              <p>Runtime artifacts without design-time iFlows.</p>
            </div>
  
            <div class="tab-content" id="failures">
              <h2>Failures</h2>
              <p>Message failures and error patterns.</p>
            </div>
  
            <div class="tab-content" id="expiry">
              <h2>Expiry Tracker</h2>
              <p>Certificates, keys, credentials nearing expiry.</p>
            </div>
  
            <div class="tab-content" id="idle">
              <h2>Idle iFlows</h2>
              <p>iFlows not triggered for a long time.</p>
            </div>

            <div class="tab-content" id="tools">
              <h2>Tools</h2>
              <p>Utilities and helper functions for SAP CPI Lens.</p>
            </div>

             <div class="tab-content" id="duplicates">
              <h2>Duplicates</h2>
              <p>Find and analyze duplicate iFlows or integrations.</p>
            </div>

            <div class="tab-content" id="help">
              <div id="helpPage" class="help-container">
              <div class="help-header">
               <h1>📘 CPI Lens – Help & Documentation</h1>
              </div>

           <!-- ACTIVITIES -->
          <section id="activities" class="help-section">
           <h2>📊 Activities Dashboard</h2>
           <p> The Activities dashboard provides a real-time snapshot of message processing for your tenant. It is the primary health indicator for your integrations.</p>
           <h3>What you see</h3>
           <ul>
             <li><b>Status Distribution</b> – Completed, Failed, Escalated, Discarded, Retry, Processing</li>
             <li><b>Total Messages</b> – Count of messages in the selected time range</li>
             <li><b>Time Range Filter</b> – Last 1, 6, 12, 24 hours or Today</li>
             <li><b>Last Refreshed Timestamp</b></li>
            </ul>
 
            <h3>How it works</h3>
            <p>CPI Lens fetches message logs once (last 24 hours) and applies all time filters locally for instant responsiveness.</p>
           <div class="tip">💡 Tip: Use the Refresh button only when you want the latest logs from CPI.</div>
          </section>

          <!-- THROUGHPUT -->
          <section id="throughput" class="help-section">
           <h2>⚡ Throughput Metrics</h2>
           <p>Throughput helps you understand how many messages your tenant processes over time and identify load patterns or spikes.</p>
           <h3>KPIs Explained</h3>
           <ul>
            <li><b>Last Hour</b> – Messages completed in the last 60 minutes</li>
            <li><b>Avg / Hour</b> – Average messages processed per active hour</li>
            <li><b>Peak / Hour</b> – Highest message count processed in any single hour</li>
            <li><b>Today Total</b> – Total messages processed since midnight</li>
           </ul>
           <p>These KPIs are calculated using message end timestamps (LogEnd) to reflect actual processing completion.Only messages in a final state—Completed, Failed, Escalated, or Discarded—are counted.</p>
          </section>

       <!-- TRENDS -->
          <section id="trends" class="help-section">
           <h2>📈 Message Processing Trends</h2>
           <p>Trends visualize how message volume and processing time change over time.This helps identify performance degradation or traffic growth.</p>
           <h3>Charts</h3>
           <ul>
            <li><b>Messages Over Time</b> – Line chart showing message volume per time bucket</li>
            <li><b>Processing Time vs Message Count</b> – Performance impact under load</li>
           </ul>
           <h3>Performance Metrics</h3>
           <ul>
             <li>⚡ Fastest (Min processing time)</li>
             <li>⏱ Average processing time</li>
             <li>🐢 Slowest (Max processing time)</li>
           </ul>
          <div class="tip">💡 Tip: Smaller time ranges use finer buckets for better accuracy.</div>
        </section>

                                   <!-- FAILED -->
  <section id="failures" class="help-section">
    <h2>❌ Failed Messages</h2>
    <p>
      This section lists failed messages for quick overview.
    </p>

    <h3>Features</h3>
    <ul>
      <li>Time-based filters (1h, 6h, 12h, 24h, Today)</li>
      <li>View mode (Individual / Group by Integration Flow name)</li>
      <li>Integration Flow name, Message Id & timestamp</li>
      <li>Direct link to CPI Message Monitor</li>
    </ul>

    <p>
      Failed messages are cached locally so switching filters does not trigger new API calls.
    </p>
    <div class="tip">
      💡 Tip: Use the Refresh button only when you want the latest logs from CPI.
    </div>
  </section>

  <!-- GHOST -->
  <section id="ghost" class="help-section">
    <h2>💤 Idle iFlows</h2>
    <p>
      Idle iFlows are deployed integration flows that have not processed messages
      for an extended period.
    </p>

    <h3>Risk Classification</h3>
    <ul>
      <li>🟢 <b>Active</b> – Messages processed within last 30 days</li>
      <li>🟡 <b>At Risk</b> – No messages for 32–90 days</li>
      <li>🔴 <b>Critical</b> – No messages for more than 90 days</li>
    </ul>

    <p class="tip">
      This helps identify obsolete or unused integrations that can be archived or removed.  Ideal for detecting deprecated, unused, or forgotten interfaces.
    </p>
  </section>

  <!-- EXPORT -->
  <section id="export" class="help-section">
    <h2>📤 Export & Reporting</h2>
    <p>
      CPI Lens allows exporting analytics data for reporting and audits.
    </p>

    <ul>
      <li>Status distribution with percentages</li>
      <li>Throughput KPIs for the current day</li>
      <li>Idle iFlows</li>
      <li>Ghosted artifacts</li>
      <li>Runtime Artifacts</li>
      <li>CSV format compatible with Excel</li>
    </ul>

    <p class="tip">
     Note: Exports always reflect the currently selected filters.
    </p>
  </section>

  <!-- SECURITY -->
  <section id="security" class="help-section">
    <h2>🛡️ Security & Privacy</h2>
    <ul>
      <li>No data stored outside your browser</li>
      <li>Uses existing CPI authentication session</li>
      <li>Read-only access to CPI OData APIs</li>
    </ul>

    <p>
      CPI Lens is safe to use in production environments.
    </p>
  </section>

  <section id="expiry" class="help-section">
    <h2>⏳ Expiry Tracker</h2>
    <p>
      The <strong>Expiry Tracker</strong> helps you proactively monitor security-related artifacts that are nearing expiration.
    </p>
    <ul>
      <li>Certificates</li>
      <li>Keys</li>
    </ul>
    <p>Status Indicators:</p>
    <ul>
      <li><span class="badge badge-green">Safe</span> – Expiry beyond threshold</li>
      <li><span class="badge badge-yellow">Warning</span> – Expiring soon</li>
      <li><span class="badge badge-red">Critical</span> – Expired or near expiry</li>
    </ul>
    <div class="tip">
      Prevents unexpected integration failures caused by expired security artifacts.
    </div>
  </section>

  <!-- Ghost Artifacts -->
  <section id="ghost" class="help-section">
    <h2>👻 Ghost Artifacts</h2>
    <p>
      Ghost artifacts are integration flows that are <strong>deployed in runtime</strong> but do <strong>not exist in design time</strong> in the tenant.
    </p>
    <ul>
      <li>Causes by Unknowwingly deleted artifacts without undeploying it from runtime.</li>
      <li>Risky for governance and maintenance</li>
    </ul>
    <div class="tip">
      CPI Lens highlights these artifacts to help restore tenant consistency.
    </div>
  </section>

  <!-- Duplicates -->
  <section id="duplicates" class="help-section">
    <h2>♻️ Duplicate Artifacts</h2>
    <p>
      Detects duplicate or near-duplicate integration flows based on naming.
    </p>
    <ul>
      <li>Reduces redundancy</li>
      <li>Improves maintainability</li>
      <li>Supports clean architecture practices</li>
    </ul>
  </section>

  <!-- Tools -->
  <section id="tools" class="help-section">
    <h2>🧰 Tools</h2>
    <p>
      A collection of utilities designed to simplify daily SAP CPI tasks.
    </p>
    <ul>
      <li>XML / JSON viewers , formatters & convertors</li>
      <li>Payload comparison</li>
      <li>Schema generatipn</li>
      <li>X-Path tester</li>
    </ul>
    <div class="tip">
      Eliminates dependency on external tools and boosts productivity. and save leaking data to external sites.
    </div>
  </section>

  <!-- Favorites -->
  <section id="favourites" class="help-section">
    <h2>⭐ Favorites</h2>
    <p>
      Mark frequently used integration flows as favorites for quick access.
    </p>
    <ul>
      <li>Persistent across sessions</li>
      <li>Ideal for production-critical iFlows</li>
      <li>Tenant specific favorites view</li>
    </ul>
  </section>

  <!-- Theme -->
  <section id"theme" class="help-section">
    <h2>🎨 Theme (Light / Dark)</h2>
    <p>
      CPI Lens supports both light and dark themes.
    </p>
    <ul>
      <li>Toggle available at the top-right corner</li>
      <li>Instant switch without reload</li>
      <li>User preference stored locally</li>
    </ul>
  </section>

  <!-- Footer -->
  <div class="help-section">
    <h3>✅ Summary</h3>
    <p>
      CPI Lens enhances SAP CPI by providing visibility, governance, and productivity features across runtime and design-time artifacts.
    </p>
  </div>

  <div class="help-footer">
    <p>Built for SAP CPI professionals 🚀</p>
  </div>

  </div>
  </div>
  <div class="tab-content" id="about">
    <div id="aboutPage" class="about-container">
    <div class="about-header">
    <h1>
       <img id="cpillenslogo2" alt="CPI Lens Logo" style="width:45px; height:40px; margin-right:10px;" /> CPI Lens
    </h1>
    <p class="about-subtitle">
      Smart observability & analytics for SAP Cloud Integration
    </p>
  </div>

  <div class="about-section">
    <p>
      CPI Lens is a lightweight analytics and monitoring layer built on top of
      <b>SAP Cloud Integration (CPI)</b>. It helps integration teams gain
      <b>instant visibility</b> into message processing, failures, throughput,
      performance trends, and inactive artifacts — all without external tools.
    </p>
  </div>

  <div class="about-section">
    <h2>🛡️ Security & Privacy</h2>
    <p>
      CPI Lens does <b>not store</b> or transmit any data externally.
      All analytics are computed locally in your browser using your
      authenticated CPI session.
    </p>
  </div>

  <div class="about-section">
    <h2>ℹ️ Version Information</h2>
    <div class="info-grid">
      <div><b>Version</b></div><div>1.1.0</div>
      <div><b>Developed by</b></div> <div> <a href="https://www.linkedin.com/in/riteek-khaul" target="_blank" rel="noopener"  style="color:#37557a;">Riteek Khaul</a></div>
      <div><b>License</b></div><div>GPL-3.0</div>
      </div>
      </div>
      <div class="about-footer">
        <p>Built with ❤️ for SAP Integration professionals</p>
      </div>
      </div>
          </section>
        </div>
  
        <!-- FOOTER -->
        <footer class="cpi-lens-footer">
         © 2026 CPI Lens by Riteek Khaul. All rights reserved.  • v1.1.0
        </footer>
  
    </div>
    `;

  document.body.appendChild(overlay);
  document.getElementById("cpillenslogo").src = chrome.runtime.getURL("assets/logo.png");
  document.getElementById("cpillenslogo2").src = chrome.runtime.getURL("assets/logo.png");
  extractTenantInfo();
  extractUserName();

  // ===== THEME HANDLING =====
  const toggle = overlay.querySelector("#cpi-theme-toggle");

  // 1️⃣ Detect system theme
  const prefersDark = window.matchMedia("(prefers-color-scheme: light)").matches;

  // 2️⃣ Load saved theme OR system theme
  const savedTheme =
    localStorage.getItem("cpi-lens-theme") ||
    (prefersDark ? "dark" : "light");

  // 3️⃣ Apply theme
  overlay.classList.add(savedTheme);
  toggle.checked = savedTheme === "dark";

  // 4️⃣ Toggle listener
  toggle.addEventListener("change", () => {
    overlay.classList.remove("light", "dark");

    const newTheme = toggle.checked ? "dark" : "light";
    overlay.classList.add(newTheme);

    localStorage.setItem("cpi-lens-theme", newTheme);
  });

  let idleContent = null;
  let failuresContent = null;
  let failuresLoaded = false;

  function initIdleIFlowsTab() {
    idleContent = document.getElementById("idle");
    fetchIdleIFlows();
  }

  const sidebar = overlay.querySelector(".cpi-lens-sidebar");
  const buttons = sidebar.querySelectorAll("button");
  const contents = overlay.querySelectorAll(".tab-content");
  let expiryContent = null;
  let expiryLoaded = false;
  let activitiesLoaded = false;
  let duplicatesContent = null;
  let duplicatesLoaded = false;
  let ghostedContent = null;
  let ghostedLoaded = false;
  let favouritesContent = null;
  let favouritesLoaded = false;
  let trendsContent = null;
  let trendsLoaded = false;


  //auto fetch analytics on start-up

  function autoFetchAnalytics() {

    let activitiesContent = document.getElementById("activities");

    activitiesContent.innerHTML = `
    <div style="padding:5px 10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
        <div "activity-title>
          <h2 style="margin-bottom:4px">Activities </h2>
          <div id="lastRefreshed"
               style="font-size:0.85rem;color:#8fa1b3;">
            Last refreshed: --
          </div>
        </div>
  
        <div>
         <div>
          <input id="mplInput" type="text" class="vc-input" placeholder="Paste the MPL Id and press Enter " />
          <button id="refreshActivitiesBtn" class="cpi-btn">
            🔄 Refresh
          </button>
          <button id="exportActivitiesBtn" class="cpi-btn secondary">
            📤 Export CSV
          </button>
        </div>
        <div class="trends-filters">
          <select id="activities-range">
            <option value="1">Last 1 Hour</option>
            <option value="6">Last 6 Hours</option>
            <option value="12">Last 12 Hours</option>
            <option value="24" selected>Last 24 Hours</option>
            <option value="today">Today</option>
          </select>
          </div>
        </div>
      </div>
  
      <div id="activitiesLoader" class="cpi-loader-container">
        <div class="cpi-loader"></div>
        <div style="margin-top:10px;">Hang tight! Loading Activities... 🔄</div>
      </div>
  
      <div id="activitiesError"
           style="display:none;color:#d32f2f;margin-bottom:12px;"></div>
  
      <div id="analyticsNoData"
           style="display:none;color:#777;text-align:center;margin-top:40px;">
            No messages found in the selected range
      </div>
  
        <div id="totalMessages">
        Total Messages: --
      </div>
  
      <div id="activitiesBars" style="margin-top:20px;"></div>

    <div id="throughputSection" style="margin-top:28px;">
    <h3 style="margin-bottom:10px;">Throughput</h3>

    <div id="throughputGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">

    <div class="tp-card">
      <div class="tp-label">Last Hour</div>
      <div class="tp-value" id="tpLastHour">--</div>
      <div class="tp-trend" id="tpTrend">--</div>
    </div>

    <div class="tp-card">
      <div class="tp-label">Avg / Hour</div>
      <div class="tp-value" id="tpAvgHour">--</div>
    </div>

    <div class="tp-card">
      <div class="tp-label">Peak / Hour</div>
      <div class="tp-value" id="tpPeakHour">--</div>
      <div class="tp-sub" id="tpPeakTime">--</div>
    </div>

    <div class="tp-card">
      <div class="tp-label">Today Total</div>
      <div class="tp-value" id="tpTodayTotal">--</div>
    </div>

    </div>
   </div>
  </div>
  `;

    document.getElementById("activities-range").addEventListener("change", e => {
      applyActivitiesTimeFilter(e.target.value);
    });

    fetchAndRenderAnalytics();
    document.addEventListener("click", (e) => {
      if (e.target.id === "refreshActivitiesBtn") {
        fetchAndRenderAnalytics();
      }
    });

    activitiesLoaded = true;

    const mplInput = document.getElementById("mplInput");

    mplInput.addEventListener("keydown", function (event) {
      const mplId = event.target.value;

      if (event.key === "Enter" && mplId.length > 12) {
        event.preventDefault(); // optional
        handleSubmit(mplId);
      } else if (event.key === "Enter" && mplId.length < 12) {
        showToast("Please enter a valid MPL Id!");
      }
    });

    function handleSubmit(mplId) {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;
      const mplURI = `${baseUrl}/shell/monitoring/Messages/%7B%22identifier%22%3A%22${mplId}%22%7D`
      window.open(mplURI, "_blank");
    }
  }

  autoFetchAnalytics();

  /* TAB SWITCHING */
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      // Remove active state
      buttons.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      // Activate clicked tab
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      const content = overlay.querySelector(`#${tabId}`);

      if (!content) {
        console.error("Tab content not found:", tabId);
        return;
      }

      content.classList.add("active");

      // Tab-specific init
      if (tabId === "idle") {
        initIdleIFlowsTab();
      }
      if (tabId === "failures" && !failuresLoaded) {
        failuresContent = content;
        fetchFailedMessages();
        failuresLoaded = true; // lazy load
      }
      if (tabId === "expiry" && !expiryLoaded) {
        expiryContent = content;
        fetchExpiryTracker();
        expiryLoaded = true; // lazy load
      }
      if (tabId === "tools") {
        toolsContent = content;
        renderTools();
      }
      if (tabId === "duplicates" && !duplicatesLoaded) {
        duplicatesContent = content;
        fetchDuplicates();
        duplicatesLoaded = true;
      }
      if (tabId === "ghosted" && !ghostedLoaded) {
        ghostedContent = content;
        fetchGhostedArtifacts();
        ghostedLoaded = true; // lazy load
      }
      if (tabId === "favourites" && !favouritesLoaded) {
        favouritesContent = content;
        fetchFavourites();
        favouritesLoaded = true; // lazy load
      }
      if (tabId === "trends" && !trendsLoaded) {
        trendsContent = content;
        fetchTrendData();
        trendsLoaded = true; // lazy load
      }

    });
  });

  //User Info

  function extractTenantInfo() {
    const host = window.location.hostname;

    const parts = host.split(".");

    let tenant = parts[0] || "Unknown";
    let region = "Unknown";

    if (host.includes("eu10")) region = "EU10";
    else if (host.includes("us10")) region = "US10";
    else if (host.includes("ap10")) region = "AP10";
    else if (host.includes("jp10")) region = "JP10";

    document.getElementById("tenantName").innerText = tenant;
    document.getElementById("regionName").innerText = region;

    updateEnvironmentBadge(tenant);

    function updateEnvironmentBadge(tenantName) {
      const env = detectEnvironment(tenantName);
      const badge = document.getElementById("envBadge");
    
      badge.textContent = env;
    
      badge.className = "env-badge"; // reset
      badge.classList.add(`env-${env.toLowerCase()}`);
    }

    function detectEnvironment(tenantIdentifier = "") {
      const value = tenantIdentifier.toLowerCase();
    
      if (
        value.includes("dev") ||
        value.includes("development") ||
        value.includes("sandbox")
      ) {
        return "DEV";
      }

      if (
        value.includes("non-prd") ||
        value.includes("non-prod")
      ) {
        return "Non-PROD";
      }
    
      if (
        value.includes("qa") ||
        value.includes("qas") ||
        value.includes("test") ||
        value.includes("tst") ||
        value.includes("uat")
      ) {
        return "QA";
      }
    
      if (
        value.includes("prod") ||
        value.includes("prd") ||
        value.includes("production") ||
        value.includes("live")
      ) {
        return "PROD";
      }

      if (
        value.includes("trial")
      ) {
        return "TRIAL";
      }
    
      return "UNKNOWN";
    }    

  }

  function extractUserName() {
    document.getElementById("userName").innerText = "Unknown";

    try {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

      const apiUrl =
        `${baseUrl}/api/1.0/user`;
      chrome.runtime.sendMessage(
        {
          type: "FETCH_USER",
          url: apiUrl,
          tenantUrl: currentUrl
        },
        (response) => {
          if (!response?.ok) {
            contents.log("Errro fetching User, Please refresh your page and try again!")
            return;
          }
          document.getElementById("userName").innerText = response.data[0].Name;
        }
      );
    } catch (err) {
      contents.log("Errro fetching User, Please refresh your page and try again!")
    }
  }

  //failed messages 
  let __CACHED_FAILEDMSG_LOGS__ = [];
  let __FAILED_RANGE__ = 24; // default  
  let __FAILED_LAST_REFRESH__ = null;
  let __FAILED_VIEW_MODE__ = "individual";

  async function fetchFailedMessages() {
    if (!failuresContent) return;

    failuresContent.innerHTML = `
      <div class="cpi-loader-container">
        <div class="cpi-loader"></div>
        <div style="margin-top:10px;">Loading failed messages...</div>
      </div>
    `;

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formattedTime = last24Hours.toISOString().split(".")[0];

    try {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

      const apiUrl =
        `${baseUrl}/odata/api/v1/MessageProcessingLogs` +
        `?$filter=Status eq 'FAILED' and LogEnd ge datetime'${formattedTime}'` +
        `&$select=MessageGuid,IntegrationFlowName,LogStart,LogEnd,Status`;

      chrome.runtime.sendMessage(
        {
          type: "FETCH_FAILED_MESSAGES",
          url: apiUrl,
          tenantUrl: currentUrl
        },
        (response) => {
          if (!response?.ok) {
            failuresContent.innerHTML =
              `<div style="padding:20px;color:#d32f2f;">Error fetching failed messages, Please refresh your page and try again!</div>`;
            return;
          }

          __CACHED_FAILEDMSG_LOGS__ = response.data?.d?.results || [];
          __FAILED_LAST_REFRESH__ = new Date();
          applyFailedMSGTimeFilter(__FAILED_RANGE__);
        }
      );
    } catch (err) {
      console.log(err.message);
      failuresContent.innerHTML =
        `<div style="padding:20px;color:#d32f2f;">Please refresh your page and try again!</div>`;
    }
  }

  function applyFailedMSGTimeFilter(range) {
    __FAILED_RANGE__ = range;

    function parseCpiDate(cpiDate) {
      const match = cpiDate?.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }

    const now = Date.now();
    let cutoff;

    if (range === "today") {
      cutoff = new Date().setHours(0, 0, 0, 0);
    } else {
      const hours = parseInt(range, 10);
      cutoff = now - hours * 60 * 60 * 1000;
    }

    const source = Array.isArray(__CACHED_FAILEDMSG_LOGS__)
      ? __CACHED_FAILEDMSG_LOGS__
      : [];

    const filtered = source.filter(msg => {
      const ts = parseCpiDate(msg.LogEnd);
      return ts && ts >= cutoff;
    });

    displayFailedMessages(filtered);
  }

  function displayFailedMessages(messageList) {
    if (!failuresContent) return;

    const currentUrl = window.location.href;
    const tenantUrl = new URL(currentUrl);
    const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

    const refreshedText = __FAILED_LAST_REFRESH__
      ? `Last refreshed: ${__FAILED_LAST_REFRESH__.toLocaleTimeString()}`
      : "Last refreshed: --";

    let html = `
       <div style="padding:16px;">
      <div class="failures-header">
        <h3>
          Failed Messages
        </h3>

        <select class="failures-view-mode " id="failures-view-mode" style="margin-right:10px;">
          <option value="individual" ${!__FAILED_VIEW_MODE__ || __FAILED_VIEW_MODE__ === "individual" ? "selected" : ""}>Individual</option>
          <option value="group" ${__FAILED_VIEW_MODE__ === "group" ? "selected" : ""}>Group By</option>
        </select>

        <div style="display:flex;align-items:center;gap:12px;">
          <span class="failure-refresh-txt">
            ${refreshedText}
          </span>

          <select class="failures-range" id="failures-range">
            <option value="1" ${__FAILED_RANGE__ == 1 ? "selected" : ""}>Last 1 Hour</option>
            <option value="6" ${__FAILED_RANGE__ == 6 ? "selected" : ""}>Last 6 Hours</option>
            <option value="12" ${__FAILED_RANGE__ == 12 ? "selected" : ""}>Last 12 Hours</option>
            <option value="24" ${__FAILED_RANGE__ == 24 ? "selected" : ""}>Last 24 Hours</option>
            <option value="today" ${__FAILED_RANGE__ === "today" ? "selected" : ""}>Today</option>
          </select>

          <button
            id="failed-refresh-btn"
            class="btn primary"
            style="padding:6px 10px;font-size:0.8rem;">
            🔄 Refresh
          </button>
        </div>
      </div>
    `;

    if (!messageList || messageList.length === 0) {
      html += `
        <div style="padding:20px;text-align:center;color:#666;">
          🎉 Congrats! No failed messages found in the selected range.
        </div>
      `;
      failuresContent.innerHTML = html + `</div>`;
      bindFailedEvents();
      // Optionally bind group/individual change
      const viewModeSelect = document.getElementById("failures-view-mode");
      if (viewModeSelect) {
        viewModeSelect.addEventListener("change", (e) => {
          __FAILED_VIEW_MODE__ = e.target.value;
          displayFailedMessages(messageList);
        });
      }
      return;
    }

    // Render grouped view
    if (__FAILED_VIEW_MODE__ === "group") {
      // group by IntegrationFlowName
      // For each group, show: flowname, latest fail time (timestamp), number of failures, and first msg guid (for open link)
      const groupMap = {};
      messageList.forEach(msg => {
        const flowName = msg.IntegrationFlowName || "Unknown";
        if (!groupMap[flowName]) {
          groupMap[flowName] = [];
        }
        groupMap[flowName].push(msg);
      });

      html += `<div class="failures-list">`;
      Object.entries(groupMap).forEach(([flowName, msgs]) => {
        // Sort messages DESC by LogStart (or LogEnd?) and take latest
        msgs.sort((a, b) => {
          // Use LogStart for timestamp, fallback to 0
          const aTs = (() => { 
            let m = a.LogStart?.match(/\/Date\((\d+)\)\//); 
            return m ? parseInt(m[1], 10) : 0;
          })();
          const bTs = (() => { 
            let m = b.LogStart?.match(/\/Date\((\d+)\)\//); 
            return m ? parseInt(m[1], 10) : 0;
          })();
          return bTs - aTs;
        });
        const latestMsg = msgs[0];
        const latestTs = (() => {
          const match = latestMsg.LogStart?.match(/\/Date\((\d+)\)\//);
          return match ? parseInt(match[1], 10) : null;
        })();
        const timeStr = latestTs ? new Date(latestTs).toLocaleString() : "Unknown time";
        const totalFailed = msgs.length;

        html += `
          <div class="failure-item">
            <div class="failure-item-header">
              <strong class="failure-item-flowname">${flowName}</strong>
              <span class="failure-item-timestamp">${timeStr}</span>
              <span style="margin-left:16px;font-weight:normal;">Total : <b>${totalFailed}</b> </span>
            </div>
            <div class="failure-item-meta">
              Most recent MessageGuid: ${latestMsg.MessageGuid || "-"}
              ${latestMsg.MessageGuid ? `
                <a
                  href="${baseUrl.replace(/\/$/, "")}/shell/monitoring/Messages/%7B%22identifier%22%3A%22${latestMsg.MessageGuid}%22%7D"
                  target="_blank"
                  >
                  ↗ Open
                </a>` : ""}
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
      failuresContent.innerHTML = html;

      // Add events for filter/view mode
      bindFailedEvents();

      // Bind view mode selector
      const viewModeSelect = document.getElementById("failures-view-mode");
      if (viewModeSelect) {
        viewModeSelect.addEventListener("change", (e) => {
          __FAILED_VIEW_MODE__ = e.target.value;
          displayFailedMessages(messageList);
        });
      }
      return;
    }

    // Default: Individual list view (original logic)
    html += `<div class="failures-list">`;

    messageList.forEach(msg => {
      const match = msg.LogStart?.match(/\/Date\((\d+)\)\//);
      const ts = match ? parseInt(match[1], 10) : null;
      const timeStr = ts ? new Date(ts).toLocaleString() : "Unknown time";

      html += `
        <div class="failure-item">
          <div class="failure-item-header">
            <strong class="failure-item-flowname">${msg.IntegrationFlowName || "Unknown"}</strong>
            <span class="failure-item-timestamp">
              ${timeStr}
            </span>
          </div>
  
          <div class="failure-item-meta" >
            MessageGuid: ${msg.MessageGuid || "-"}
            ${msg.MessageGuid ? `
              <a
                href="${baseUrl.replace(/\/$/, "")}/shell/monitoring/Messages/%7B%22identifier%22%3A%22${msg.MessageGuid}%22%7D"
                target="_blank"
                >
                ↗ Open
              </a>` : ""}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    failuresContent.innerHTML = html;

    bindFailedEvents();

    // Bind view mode selector so toggling doesn't require reload
    const viewModeSelect = document.getElementById("failures-view-mode");
    if (viewModeSelect) {
      viewModeSelect.addEventListener("change", (e) => {
        __FAILED_VIEW_MODE__ = e.target.value;
        displayFailedMessages(messageList);
      });
    }
  }

  function bindFailedEvents() {
    document.getElementById("failures-range")
      ?.addEventListener("change", e =>
        applyFailedMSGTimeFilter(e.target.value)
      );

    document.getElementById("failed-refresh-btn")
      ?.addEventListener("click", () =>
        fetchFailedMessages(false)
      );
  }

  // idle iflows
  async function fetchIdleIFlows() {
    if (!idleContent) return;

    idleContent.innerHTML = `
        <div class="cpi-loader-container">
          <div class="cpi-loader"></div>
          <div style="margin-top:10px;">Loading idle IFlows...Please wait! this could take a minute.</div>
        </div>
      `;

    try {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

      const deployedApiUrl =
        `${baseUrl}/api/v1/IntegrationRuntimeArtifacts`
        + `?$filter=Type eq 'INTEGRATION_FLOW'`
        + `&$select=Id,Name,Version,DeployedOn,Type`;

      chrome.runtime.sendMessage(
        {
          type: "FETCH_DEPLOYED_IFLOWS",
          url: deployedApiUrl,
          tenantUrl: currentUrl
        },
        async (response) => {
          if (!response?.ok) {
            idleContent.innerHTML = `<div>Please refresh your page and try again!</div>`;
            return;
          }

          const iFlows = response.data?.d?.results || [];
          const lastMsgPromises = iFlows.map(flow => {
            const msgUrl =
              `${baseUrl}/odata/api/v1/MessageProcessingLogs`
              + `?$filter=IntegrationFlowName eq '${encodeURIComponent(flow.Id)}'`
              + `&$orderby=LogStart desc&$top=1&$select=LogStart`;
            return new Promise(resolve => {
              chrome.runtime.sendMessage(
                {
                  type: "FETCH_LAST_PROCESSED_MESSAGE",
                  url: msgUrl,
                  tenantUrl: currentUrl
                },
                msgResp => {
                  resolve({
                    ...flow,
                    __lastMsgDate:
                      msgResp?.data?.d?.results?.[0]?.LogStart || null
                  });
                }
              );
            });
          });

          idleContent.innerHTML = `
              <div class="cpi-loader-container">
                <div class="cpi-loader"></div>
                <div>Analyzing inactivity...</div>
              </div>
            `;

          const finalData = await Promise.all(lastMsgPromises);
          displayIdleIFlows(finalData);
        }
      );
    } catch (err) {
      console.log(err.message)
      idleContent.innerHTML = `<div>Please refresh your page and try again!</div>`;
    }
  }
  function displayIdleIFlows(data) {

    // Create counters for each iFlow status
    let activeCount = 0;
    let atRiskCount = 0;
    let idleCount = 0;

    if (!idleContent) return;
    // Transform the data into an array, making sure to handle the OData response format or a possible array directly
    let iFlows = [];
    if (data && data.d && Array.isArray(data.d.results)) {
      iFlows = data.d.results;
    } else if (Array.isArray(data)) {
      iFlows = data;
    }

    function parseAnyDate(dateStr) {
      if (!dateStr) return null;

      // SAP OData format: /Date(1768566735102)/
      const match = typeof dateStr === "string" && dateStr.match(/\/Date\((\d+)\)\//);
      if (match) {
        return new Date(Number(match[1]));
      }

      // ISO or normal date
      const d = new Date(dateStr);
      return isNaN(d) ? null : d;
    }


    function formatDate(dateStr) {
      const d = parseAnyDate(dateStr);
      if (!d) return "-";

      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }

    // Helper to calculate days since last message
    function calcIdleDays(lastMsgDate) {
      const last = parseAnyDate(lastMsgDate);
      if (!last) return "-";

      const now = new Date();
      const diffMs = now - last;

      if (diffMs < 0) return "0"; // safety

      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // Helper: status rendering
    function getStatusCell(idleDays) {

      if (typeof idleDays !== "number" || isNaN(idleDays)) {
        return `<span style="color:#757575;">-</span>`;
      }
      if (idleDays <= 31) {
        return `<span title="Active" style="font-weight:bold;color:#29b364;">🟢 Active</span>`;
      } else if (idleDays <= 90) {
        return `<span title="At Risk" style="font-weight:bold;color:#e1b62a;">🟡 At Risk</span>`;
      } else {
        return `<span title="Idle" style="font-weight:bold;color:#d32f2f;">🔴 Idle</span>`;
      }
    }

    // Discard flows for which idle days are <= 31
    iFlows = iFlows.filter(flow => {
      const idleDays = calcIdleDays(flow.__lastMsgDate);
      if (idleDays <= 31) activeCount++;
      else if (idleDays <= 90) atRiskCount++;
      else if (idleDays > 90) {
        idleCount++;
      }
      // Exclude (discard) flows where idle days are 31 or less
      if (idleDays === "-" || typeof idleDays !== "number" || isNaN(idleDays)) return false;
      return idleDays > 31;
    });

    let tableRows = "";
    if (iFlows.length === 0) {
      tableRows = `<tr><td colspan="6" style="padding: 32px 0; color: #999;text-align:center;font-size:1.03em;">Congrats! No idle iFlows found.</td></tr>`;
    } else {
      tableRows = iFlows.map(flow => {
        const name = flow.Name || '-';
        const version = flow.Version || "-";
        const deployDate = formatDate(flow.DeployedOn);
        const lastMsgDate = formatDate(flow.__lastMsgDate);
        let idleDays = calcIdleDays(flow.__lastMsgDate);
        const idleDaysDisplay = idleDays === "-" ? "-" : idleDays;
        // If the date string led to NaN, show dash in both columns
        if (idleDaysDisplay === "-") idleDays = undefined;

        return `
          <tr>
            <td>${name}</td>
            <td>${version}</td>
            <td>${deployDate}</td>
            <td>${lastMsgDate}</td>
            <td style="text-align:center;">${idleDaysDisplay}</td>
            <td style="text-align:center;">${getStatusCell(idleDays)}</td>
          </tr>
        `;
      }).join("");
    }

    idleContent.innerHTML = `
    <div style="padding:16px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 id="idle-iflows-title" style="margin-bottom: 0;">Idle IFlows</h3>
        <span style="display: flex; align-items: center; margin-left: 12px; cursor:pointer;" title="Export to Excel" id="exportIdleIflowsToExcel">
          <img src="${chrome.runtime.getURL('assets/xls.png')}" alt="Export to Excel" style="width:20px; height:20px; display:block;" />
        </span>
      </div>
      <div style="overflow-x:auto;">
        <table id="idle-iflows-table">
          <thead>
            <tr>
              <th>iFlow Name</th>
              <th>Version</th>
              <th>Deployed On</th>
              <th>Last Message On</th>
              <th>Idle Days</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
      <div style="margin-top:6px;margin-left:2px;font-size:0.93em;color:#999;">
        <span title="Active" style="margin-right:16px;vertical-align:middle;"><span style="font-weight:bold;color:#3bc14a;">🟢 Active</span>: <span style="font-weight:bold;">${activeCount}</span> (&lt; 32 days)</span>
        <span title="At Risk" style="margin-right:16px;vertical-align:middle;"><span style="font-weight:bold;color:#e1b62a;">🟡 At Risk</span>: <span style="font-weight:bold;">${atRiskCount}</span> ( 32 - 90 days )</span>
        <span title="Idle" style="vertical-align:middle;"><span style="font-weight:bold;color:#d32f2f;">🔴 Idle</span>: <span style="font-weight:bold;">${idleCount}</span> ( &gt; 90 days)</span>
      </div>
      </div>
    `;

    // Bind the export button click event
    const exportBtn = document.getElementById("exportIdleIflowsToExcel");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportIdleIflowsToExcel);
    }

    function exportIdleIflowsToExcel() {

      function getSeverityStatus(idleDays) {

        if (typeof idleDays !== "number" || isNaN(idleDays)) {
            return `-`;
          }
        if (idleDays <= 31) {
          return `Active`;
        } else if (idleDays <= 60) {
          return `At Risk`;
        } else {
          return `Idle`;
        }
      }
      const headers = "Name,Version,DeployedOn,LastMessageOn,IdleDays,Severity";
      const csvRows = iFlows.map(flow => {
        return [flow.Name, flow.Version, formatDate(flow.DeployedOn), formatDate(flow.__lastMsgDate), calcIdleDays(flow.__lastMsgDate), getSeverityStatus(calcIdleDays(flow.__lastMsgDate))].join(",");
      });
      const csv = [headers, ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IdleIFlows_CloudIntegration.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

  }

  // expiry tracker
  async function fetchExpiryTracker() {
    if (!expiryContent) return;

    expiryContent.innerHTML = `
      <div class="cpi-loader-container">
        <div class="cpi-loader"></div>
        <div style="margin-top:10px;color:#666;font-size:0.96em;">
          Loading expiry tracker...
        </div>
      </div>
    `;

    try {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;
      const apiUrl = `${baseUrl}/odata/api/v1/KeystoreEntries`;

      chrome.runtime.sendMessage(
        {
          type: "FETCH_EXPIRY_TRACKER",
          url: apiUrl,
          tenantUrl: currentUrl
        },
        (response) => {
          if (!response?.ok) {
            expiryContent.innerHTML = `
              <div style="padding:24px;color:#d32f2f;">
               Please refresh your page and try again!
              </div>`;
            return;
          }

          displayExpiryTracker(response.data);
        }
      );
    } catch (err) {
      console.log(err.message)
      expiryContent.innerHTML = `
        <div style="padding:24px;color:#d32f2f;">Please refresh your page and try again!</div>`;
    }
  }
  function displayExpiryTracker(data) {
    if (!expiryContent) return;
    const entries = Array.isArray(data?.d?.results) ? data.d.results : Array.isArray(data?.results) ? data.results : [];

    expiryContent.innerHTML = `
     <div id="expiry">
      <h3>Expiry Tracker</h3>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Type</th>
              <th>Valid Until</th>
              <th>Days Left</th>
            </tr>
          </thead>
          <tbody>
            ${(entries).length === 0
        ? `<tr><td colspan="4" style="padding:12px; text-align:center; color:#888;">No entries found.</td></tr>`
        : (entries).map(entry => {
          let ValidNotAfter = entry.ValidNotAfter;

          // SAP returns /Date(1672444800000)/
          function parseSapDate(sapDate) {
            if (!sapDate) return null;
            // Try ISO string first
            if (!/^\/Date\(/.test(sapDate)) {
              let parsedDate = new Date(sapDate);
              if (!isNaN(parsedDate)) return parsedDate;
            }
            // SAP format: /Date(1672444800000)/
            const m = sapDate.match(/^\/Date\((\d+)\)\/$/);
            if (m && m[1]) {
              return new Date(Number(m[1]));
            }
            return null;
          }

          let validUntilDate = parseSapDate(ValidNotAfter);
          let now = new Date();
          let daysLeft = validUntilDate ? Math.round((validUntilDate - now) / (1000 * 60 * 60 * 24)) : '';
          let daysColor =
            daysLeft === '' ? '#333'
              : daysLeft < 0 ? '#c62828'
                : daysLeft <= 30 ? '#ee9911'
                  : '#388e3c';
          function formatDate(dateObj) {
            if (!dateObj) return '-';
            // Format as YYYY-MM-DD HH:mm
            return (
              dateObj.getFullYear() +
              "-" +
              String(dateObj.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(dateObj.getDate()).padStart(2, "0") +
              " " +
              String(dateObj.getHours()).padStart(2, "0") +
              ":" +
              String(dateObj.getMinutes()).padStart(2, "0")
            );
          }
          return `
                      <tr>
                        <td>${entry.Alias || entry.alias || '-'}</td>
                        <td>${entry.KeyType || 'Unknown'}</td>
                        <td>
                          ${formatDate(validUntilDate)}
                        </td>
                        <td style="padding:8px 6px; border-bottom:1px solid #ececec; color:${daysColor}; font-weight: 500;">
                          ${daysLeft === '' ? '-' : daysLeft >= 0 ? daysLeft + ' days' : 'Expired'}
                        </td>
                      </tr>
                    `;
        }).join('')
      }
          </tbody>
        </table>
      </div>
    `;
  }

  //Activities
  let __CACHED_ACTIVITY_LOGS__ = [];

  async function fetchAndRenderAnalytics() {

    const loader = document.getElementById("activitiesLoader");
    const errorEl = document.getElementById("activitiesError");
    const container = document.getElementById("activitiesBars");
    const noData = document.getElementById("analyticsNoData");

    const refreshBtn = document.getElementById("refreshActivitiesBtn");
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.style.opacity = "0.6";
      refreshBtn.textContent = "⏳ Refreshing...";
    }

    loader.style.display = "flex";
    errorEl.style.display = "none";
    container.innerHTML = "";
    noData.style.display = "none";

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // CPI expects UTC without milliseconds
    const formattedTime = last24Hours.toISOString().split(".")[0];

    try {
      const currentUrl = window.location.href;
      const tenant = new URL(currentUrl);
      const baseUrl = `${tenant.protocol}//${tenant.host}`;

      const apiUrl = `${baseUrl}/odata/api/v1/MessageProcessingLogs?$filter=LogEnd ge datetime'${formattedTime}'&$select=MessageGuid,IntegrationFlowName,LogStart,LogEnd,Status`;
      chrome.runtime.sendMessage(
        {
          type: "FETCH_ANALYTICS_ACTIVITIES",
          url: apiUrl,
          tenantUrl: currentUrl
        },
        (response) => {
          loader.style.display = "none";

          if (!response?.ok) {
            errorEl.textContent ="Please refresh your page and try again!";
            errorEl.style.display = "block";
            return;
          }
          __CACHED_ACTIVITY_LOGS__ = response.data?.d?.results || [];

          // default render = 24 hours
          applyActivitiesTimeFilter(24);
        }
      );
    } catch (err) {
      loader.style.display = "none";
      errorEl.textContent = "Please refresh your page and try again!";
      errorEl.style.display = "block";
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = "1";
        refreshBtn.textContent = "🔄 Refresh";
      }
    }
  }
  function applyActivitiesTimeFilter(range) {

    function parseCpiDate(cpiDate) {
      const match = cpiDate?.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }

    const now = Date.now();
    if (range === "today") {
      cutoff = new Date().setHours(0, 0, 0, 0);
    } else {
      const hours = parseInt(range, 10);
      cutoff = now - hours * 60 * 60 * 1000;
    }

    const filtered = __CACHED_ACTIVITY_LOGS__.filter(msg => {
      const ts = parseCpiDate(msg.LogEnd);
      return ts && ts >= cutoff;
    });

    // reuse existing renderer
    renderStatusDistribution({ d: { results: filtered } });
  }
  function renderStatusDistribution(data) {
    const container = document.getElementById("activitiesBars");
    if (!container) return;
    const noData = document.getElementById("analyticsNoData");
    container.innerHTML = "";
    noData.style.display = "none";


    const results = data?.d?.results || [];

    const stats = {
      COMPLETED: 0,
      FAILED: 0,
      ESCALATED: 0,
      DISCARDED: 0,
      RETRY: 0,
      PROCESSING: 0
    };

    results.forEach(msg => {

      const status = (msg.Status || "").toUpperCase();
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });

    window.__ACTIVITY_STATS__ = stats; // for export

    const total = stats.COMPLETED + stats.FAILED + stats.ESCALATED + stats.DISCARDED;

    if (results.length === 0) {
      renderEmptyDistribution();
      return;
    }

    document.getElementById("totalMessages").textContent =
      `Total Messages: ${total}`;

    document.getElementById("lastRefreshed").textContent =
      `Last refreshed: ${new Date().toLocaleTimeString()}`;


    const config = [
      { key: "COMPLETED", label: "Messages COMPLETED", color: "#4caf50", icon: "✅" },
      { key: "FAILED", label: "Messages FAILED", color: "#d32f2f", icon: "❌" },
      { key: "ESCALATED", label: "Messages ESCALATED", color: "#fbc02d", icon: "⚠️" },
      { key: "DISCARDED", label: "Messages DISCARDED", color: "#607d8b", icon: "🗑️" },
      { key: "RETRY", label: "Messages RETRY", color: "#9c27b0", icon: "🔁" },
      { key: "PROCESSING", label: "Messages PROCESSING", color: "#ff9800", icon: "🟠" }
    ];

    container.innerHTML = config.map(c => {
      const value = stats[c.key];
      const percent = total === 0 ? 0 : ((value / total) * 100).toFixed(1);

      return `
      <div class="status-row" title="${c.label}: ${value} (${percent}%)">
        <div class="status-label">
          ${c.icon} ${c.label}
        </div>

        <div class="status-bar-bg">
          <div class="status-bar-fill"
               style="width:${percent}%;background:${c.color};">
          </div>
        </div>

        <div class="status-value">
          ${value} (${percent}%)
        </div>
      </div>
    `;
    }).join("");

    // throughput 
    renderThroughputDashboard(results);

  }
  function renderEmptyDistribution() {
    const container = document.getElementById("activitiesBars");
    const noData = document.getElementById("analyticsNoData");

    // Reset total
    document.getElementById("totalMessages").textContent =
      "Total Messages: 0";

    // Show empty message
    noData.textContent = "No messages found in the selected range";
    noData.style.display = "block";

    // Render zero bars
    const config = [
      { label: "Messages COMPLETED", color: "#4caf50", icon: "✅" },
      { label: "Messages FAILED", color: "#d32f2f", icon: "❌" },
      { label: "Messages ESCALATED", color: "#fbc02d", icon: "⚠️" },
      { label: "Messages DISCARDED", color: "#607d8b", icon: "🗑️" },
      { label: "Messages RETRY", color: "#9c27b0", icon: "🔁" },
      { label: "Messages PROCESSING", color: "#ff9800", icon: "🟠" }
    ];

    container.innerHTML = config.map(c => `
      <div class="status-row status-row-disabled">
        <div class="status-label">${c.icon} ${c.label}</div>
  
        <div class="status-bar-bg">
          <div class="status-bar-fill" style="width:0%;background:${c.color};opacity:0.25;"></div>
        </div>
  
        <div class="status-value">0 (0%)</div>
      </div>
    `).join("");
  }

  function renderThroughputDashboard(logs) {
    const kpi = calculateThroughputKPIs(logs);

    function calculateTrend(logs) {

      function parseCpiDate(cpiDate) {
        const match = cpiDate?.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      }

      const now = Date.now();
      const oneHour = 3600000;

      let current = 0;
      let previous = 0;

      logs.forEach(log => {
        const ts = parseCpiDate(log.LogEnd);
        if (!ts) return;

        if (ts >= now - oneHour) current++;
        else if (ts >= now - 2 * oneHour) previous++;
      });

      if (!previous) return "—";

      const diff = Math.round(((current - previous) / previous) * 100);
      return diff >= 0
        ? `↑ +${diff}%`
        : `↓ ${diff}%`;
    }

    document.getElementById("tpLastHour").textContent = kpi.lastHour;
    document.getElementById("tpAvgHour").textContent = kpi.avgHour;
    document.getElementById("tpPeakHour").textContent = kpi.peakCount;
    document.getElementById("tpPeakTime").textContent = kpi.peakHour;
    document.getElementById("tpTodayTotal").textContent = kpi.todayTotal;
    document.getElementById("tpTrend").textContent = calculateTrend(logs);

    window.__THROUGHPUT_STATS__ = {
      ...kpi,
      date: new Date().toISOString().slice(0, 10)
    };

  }
  function calculateThroughputKPIs(logs) {

    function parseCpiDate(cpiDate) {
      const match = cpiDate?.match(/\d+/);
      return match ? parseInt(match[0], 10) : null;
    }

    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    let lastHour = 0;
    let todayTotal = 0;

    const hourBuckets = {};

    logs.forEach(log => {
      const ts = parseCpiDate(log.LogEnd);
      if (!ts) return;

      if (!["COMPLETED", "FAILED", "ESCALATED", "DISCARDED"].includes(log.Status)) {
        return;
      }

      if (ts >= oneHourAgo) lastHour++;
      if (ts >= startOfDay) todayTotal++;

      const h = new Date(ts).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    });

    const values = Object.values(hourBuckets);
    const avgHour = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;

    let peakHour = null;
    let peakCount = 0;

    Object.entries(hourBuckets).forEach(([h, c]) => {
      if (c > peakCount) {
        peakCount = c;
        peakHour = Number(h);
      }
    });

    return {
      lastHour,
      avgHour,
      peakCount,
      peakHour: peakHour !== null ? `${peakHour}:00–${(peakHour + 1) % 24}:00` : "N/A",
      todayTotal
    };
  }

  //export csv report 
  document.addEventListener("click", (e) => {
    if (e.target.id !== "exportActivitiesBtn") return;

    const stats = window.__ACTIVITY_STATS__;
    const tp = window.__THROUGHPUT_STATS__;

    if (!stats && !tp) return;

    let csv = "";

    /* =========================
       STATUS DISTRIBUTION
       ========================= */

    csv += "Status Distribution\n";
    csv += "Status,Count,Percentage\n";

    const total =
      (stats?.COMPLETED || 0) +
      (stats?.FAILED || 0) +
      (stats?.ESCALATED || 0) +
      (stats?.DISCARDED || 0);

    Object.entries(stats || {}).forEach(([k, v]) => {
      const pct = total === 0 ? 0 : ((v / total) * 100).toFixed(1);
      csv += `${k},${v},${pct}%\n`;
    });

    csv += "\n";

    /* =========================
       THROUGHPUT (CURRENT DATE)
       ========================= */

    csv += "Throughput Metrics \n";
    csv += "Metric,Value\n";

    if (tp) {
      csv += `Date,${tp.date}\n`;
      csv += `Messages Last Hour,${tp.lastHour}\n`;
      csv += `Average Messages / Hour,${tp.avgHour}\n`;
      csv += `Peak Messages / Hour,${tp.peakCount}\n`;
      csv += `Peak Hour,${tp.peakHour}\n`;
      csv += `Total Messages Today,${tp.todayTotal}\n`;
    } else {
      csv += "No throughput data available\n";
    }

    /* =========================
       DOWNLOAD
       ========================= */

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cpi-activities-throughput-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  });

  // TRENDS 

  async function fetchTrendData() {
    if (!trendsContent) return;

    trendsContent.innerHTML = `
    <div class="trends-container">

      <div class="trends-header">
        <h2>📈 Message Processing Trends</h2>

        <div class="trends-filters">
          <select id="trend-range">
            <option value="1">Last 1 Hour</option>
            <option value="6">Last 6 Hours</option>
            <option value="12">Last 12 Hours</option>
            <option value="24" selected>Last 24 Hours</option>
          </select>

          <div class="refresh-wrapper">
            <button class="btn primary" id="refresh-trends">Refresh</button>
            <div id="lastRefreshedCompleted">Last refreshed: --</div>
          </div>
        </div>
      </div>

      <div id="totalCompletedMessages"
        style="margin:10px 0;font-weight:600">
        Total Completed Messages: --
      </div>

      <div class="perf-card tooltip-wrapper">
        <div class="perf-item">
          <div class="perf-label">⚡ Fastest</div>
          <div class="perf-value" id="Min">–</div>
        </div>
        <div class="perf-item">
          <div class="perf-label">⏱ Average</div>
          <div class="perf-value" id="Avg">–</div>
        </div>
        <div class="perf-item">
          <div class="perf-label">🐢 Slowest</div>
          <div class="perf-value" id="Max">–</div>
        </div>
        <div class="tooltip">Only completed messages</div>
      </div>

      <div class="trends-grid two-col">
       <div class="trend-card">
        <h4>Messages Over Time</h4>
       <div id="trend-msg-volume" class="trend-chart"></div>
      </div>

     <div class="trend-card">
       <h4>Processing Time vs Message Count</h4>
       <div id="trend-proc-time" class="trend-chart"></div>
     </div>
     </div>

    </div>
  `;

    document.getElementById("refresh-trends").addEventListener("click", () => {
      fetchTrendData();
    });


    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formattedTime = last24.toISOString().split(".")[0];

    try {
      const tenantUrl = new URL(window.location.href);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

      const apiUrl =
        `${baseUrl}/odata/api/v1/MessageProcessingLogs` +
        `?$filter=LogEnd ge datetime'${formattedTime}'` +
        `&$select=MessageGuid,LogStart,LogEnd,Status`;

      chrome.runtime.sendMessage(
        {
          type: "FETCH_MPL_LOGS",
          url: apiUrl,
          tenantUrl: window.location.href
        },
        (response) => {
          if (!response?.ok) {
            trendsContent.innerHTML =
              `<div style="padding:20px;color:#d32f2f">Please refresh your page and try again!</div>`;
            return;
          }

          renderMPLTrends(response.data?.d?.results || []);
        }
      );
    } catch (e) {
      trendsContent.innerHTML =
        `<div style="padding:20px;color:#d32f2f">Please refresh your page and try again!</div>`;
    }
  }

  function renderMPLTrends(MPLLogs) {

    let total = MPLLogs.length
    document.getElementById("totalCompletedMessages").textContent = `Total Completed Messages: ${total}`;
    document.getElementById("lastRefreshedCompleted").textContent = `Last refreshed: ${new Date().toLocaleTimeString()}`;

    // ---- SAP Date Parser
    function parseSapDate(sapDate) {
      if (!sapDate) return null;
      const m = String(sapDate).match(/(\d{10,})/);
      return m ? new Date(Number(m[1])) : null;
    }

    // ---- Bucketing Logic
    function bucketMessages(logs, hours) {
      const now = new Date();
      const from = new Date(now.getTime() - hours * 60 * 60 * 1000);

      const bucketMinutes =
        hours <= 1 ? 5 :
          hours <= 6 ? 30 : 60;

      const buckets = {};

      logs.forEach(log => {
        const start = parseSapDate(log.LogStart);
        const end = parseSapDate(log.LogEnd);

        // ✅ filter by END time
        if (!start || !end || end < from) return;

        const duration = end - start;

        const rounded = new Date(end);
        rounded.setMinutes(
          Math.floor(rounded.getMinutes() / bucketMinutes) * bucketMinutes,
          0, 0
        );

        const key = rounded.toISOString();
        if (!buckets[key]) {
          buckets[key] = {
            time: new Date(rounded),
            count: 0,
            total: 0,
            min: Infinity,
            max: 0
          };
        }

        const b = buckets[key];
        b.count++;
        b.total += duration;
        b.min = Math.min(b.min, duration);
        b.max = Math.max(b.max, duration);
      });

      return Object.values(buckets)
        .sort((a, b) => a.time - b.time)
        .map(b => ({
          time: b.time,
          count: b.count,
          avg: Math.round(b.total / b.count),
          min: b.min,
          max: b.max
        }));
    }

    function renderMessagesOverTime(containerId, data) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!data.length) {
        container.innerHTML =
          `<div style="padding:40px;text-align:center;color:#8fa1b3">
          No completed messages in selected time range
        </div>`;
        return;
      }

      const width = 500;
      const height = 180;

      const padding = {
        left: 70,
        right: 30,
        top: 30,
        bottom: 50
      };

      const maxY = Math.max(...data.map(d => d.count), 1);
      const points = data.length;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.classList.add("trend-svg");

      /* ---------------- Y GRID + LABELS ---------------- */
      const yTicks = 4;
      for (let i = 0; i <= yTicks; i++) {
        const y =
          height - padding.bottom -
          (i / yTicks) * (height - padding.top - padding.bottom);

        const value = Math.round((i / yTicks) * maxY);

        // grid
        const grid = document.createElementNS(svg.namespaceURI, "line");
        grid.setAttribute("x1", padding.left);
        grid.setAttribute("y1", y);
        grid.setAttribute("x2", width - padding.right);
        grid.setAttribute("y2", y);
        grid.setAttribute("stroke", "#24334a");
        grid.setAttribute("stroke-dasharray", "4 4");
        svg.appendChild(grid);

        // label
        const label = document.createElementNS(svg.namespaceURI, "text");
        label.setAttribute("x", padding.left - 12);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", "12");
        label.setAttribute("fill", "#8fa1b3");
        label.textContent = value;
        svg.appendChild(label);
      }

      /* ---------------- LINE PATH ---------------- */
      let path = "";
      data.forEach((d, i) => {
        const x =
          padding.left +
          (i / (points - 1 || 1)) *
          (width - padding.left - padding.right);

        const y =
          height - padding.bottom -
          (d.count / maxY) *
          (height - padding.top - padding.bottom);

        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      });

      const line = document.createElementNS(svg.namespaceURI, "path");
      line.setAttribute("d", path);
      line.setAttribute("stroke", "#4da3ff");
      line.setAttribute("stroke-width", "3");
      line.setAttribute("fill", "none");
      svg.appendChild(line);

      /* ---------------- POINTS + TOOLTIP ---------------- */
      data.forEach((d, i) => {
        const x =
          padding.left +
          (i / (points - 1 || 1)) *
          (width - padding.left - padding.right);

        const y =
          height - padding.bottom -
          (d.count / maxY) *
          (height - padding.top - padding.bottom);

        const c = document.createElementNS(svg.namespaceURI, "circle");
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("r", 5);
        c.setAttribute("fill", "#4da3ff");

        c.addEventListener("mouseenter", () => {
          const tip = document.createElement("div");
          tip.className = "trend-tooltip";
          tip.innerHTML = `
          <strong>${d.count}</strong> messages<br/>
          ${d.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        `;
          tip.style.position = "absolute";
          tip.style.background = "#0f172a";
          tip.style.border = "1px solid #334155";
          tip.style.color = "#c7d2fe";
          tip.style.padding = "6px 10px";
          tip.style.borderRadius = "6px";
          tip.style.fontSize = "12px";
          tip.style.pointerEvents = "none";
          tip.style.left = `${x + 20}px`;
          tip.style.top = `${y}px`;
          tip.style.zIndex = 20;

          container.appendChild(tip);
          c._tip = tip;
        });

        c.addEventListener("mouseleave", () => {
          if (c._tip) c._tip.remove();
        });

        svg.appendChild(c);
      });

      /* ---------------- X LABELS ---------------- */
      const labelEvery =
        data.length <= 12 ? 1 :
          data.length <= 24 ? 2 :
            Math.ceil(data.length / 8);

      data.forEach((d, i) => {
        if (i % labelEvery !== 0 && i !== data.length - 1) return;

        const x =
          padding.left +
          (i / (points - 1 || 1)) *
          (width - padding.left - padding.right);

        const label = document.createElementNS(svg.namespaceURI, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", height - padding.bottom + 24);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "11");
        label.setAttribute("fill", "#aeb7d5");
        label.textContent =
          d.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        svg.appendChild(label);
      });

      /* ---------------- AXIS TITLES ---------------- */
      const yTitle = document.createElementNS(svg.namespaceURI, "text");
      yTitle.setAttribute("x", 18);
      yTitle.setAttribute("y", height / 2);
      yTitle.setAttribute("fill", "#94a3b8");
      yTitle.setAttribute("font-size", "13");
      yTitle.setAttribute("transform", `rotate(-90 18 ${height / 2})`);
      yTitle.textContent = "Messages";
      svg.appendChild(yTitle);

      const xTitle = document.createElementNS(svg.namespaceURI, "text");
      xTitle.setAttribute("x", width / 2);
      xTitle.setAttribute("y", height - 12);
      xTitle.setAttribute("text-anchor", "middle");
      xTitle.setAttribute("fill", "#94a3b8");
      xTitle.setAttribute("font-size", "13");
      xTitle.textContent = "Time";
      svg.appendChild(xTitle);

      /* ---------------- LEGEND ---------------- */
      const legend = document.createElementNS(svg.namespaceURI, "g");

      const lDot = document.createElementNS(svg.namespaceURI, "circle");
      lDot.setAttribute("cx", width - 160);
      lDot.setAttribute("cy", 18);
      lDot.setAttribute("r", 5);
      lDot.setAttribute("fill", "#4da3ff");

      const lText = document.createElementNS(svg.namespaceURI, "text");
      lText.setAttribute("x", width - 148);
      lText.setAttribute("y", 22);
      lText.setAttribute("fill", "#c7d2fe");
      lText.setAttribute("font-size", "12");
      lText.textContent = "Completed messages";

      legend.appendChild(lDot);
      legend.appendChild(lText);
      svg.appendChild(legend);

      container.innerHTML = "";
      container.appendChild(svg);
    }

    function renderProcessingTimeChart(containerId, data) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!data.length) {
        container.innerHTML =
          `<div style="padding:40px;text-align:center;color:#8fa1b3">
          No data available
        </div>`;
        return;
      }

      const width = 500;
      const height = 180;

      const padding = {
        left: 70,
        right: 30,
        top: 30,
        bottom: 50
      };

      const maxX = Math.max(...data.map(d => d.count), 1);
      const maxY = Math.max(...data.map(d => d.avg), 1);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.classList.add("trend-svg");

      /* ---------- GRID + Y LABELS ---------- */
      for (let i = 0; i <= 4; i++) {
        const y =
          height - padding.bottom -
          (i / 4) * (height - padding.top - padding.bottom);

        const val = Math.round((i / 4) * maxY);

        const line = document.createElementNS(svg.namespaceURI, "line");
        line.setAttribute("x1", padding.left);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding.right);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#24334a");
        line.setAttribute("stroke-dasharray", "4 4");
        svg.appendChild(line);

        const label = document.createElementNS(svg.namespaceURI, "text");
        label.setAttribute("x", padding.left - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-size", "11");
        label.setAttribute("fill", "#8fa1b3");
        label.textContent = `${val} ms`;
        svg.appendChild(label);
      }

      /* ---------- DOTS ---------- */
      data.forEach(d => {
        const x =
          padding.left +
          (d.count / maxX) *
          (width - padding.left - padding.right);

        const y =
          height - padding.bottom -
          (d.avg / maxY) *
          (height - padding.top - padding.bottom);

        const dot = document.createElementNS(svg.namespaceURI, "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 6);
        dot.setAttribute("fill", "#34d399");

        dot.addEventListener("mouseenter", () => {
          const tip = document.createElement("div");
          const rect = container.getBoundingClientRect();
          tip.className = "trend-tooltip";
          tip.innerHTML = `
          <strong>${d.count}</strong> messages<br/>
          Avg time: <strong>${d.avg} ms</strong>
        `;
          tip.style.position = "absolute";
          tip.style.background = "#0f172a";
          tip.style.border = "1px solid #334155";
          tip.style.color = "#c7d2fe";
          tip.style.padding = "6px 10px";
          tip.style.borderRadius = "6px";
          tip.style.fontSize = "12px";
          tip.style.pointerEvents = "none";
          tip.style.left = `${rect.left + x + 12}px`;
          tip.style.top = `${rect.top + y - 10}px`;
          container.appendChild(tip);
          dot._tip = tip;
        });

        dot.addEventListener("mouseleave", () => {
          if (dot._tip) dot._tip.remove();
        });

        svg.appendChild(dot);
      });

      /* ---------- X AXIS TICKS + LABELS ---------- */
      const xTicks = 4;

      for (let i = 0; i <= xTicks; i++) {
        const x =
          padding.left +
          (i / xTicks) * (width - padding.left - padding.right);

        const val = Math.round((i / xTicks) * maxX);

        // Tick line
        const tick = document.createElementNS(svg.namespaceURI, "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", height - padding.bottom);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", height - padding.bottom + 6);
        tick.setAttribute("stroke", "#475569");
        svg.appendChild(tick);

        /* ---------- X GRID LINES ---------- */
        for (let i = 0; i <= xTicks; i++) {
          const x =
            padding.left +
            (i / xTicks) * (width - padding.left - padding.right);

          const grid = document.createElementNS(svg.namespaceURI, "line");
          grid.setAttribute("x1", x);
          grid.setAttribute("y1", padding.top);
          grid.setAttribute("x2", x);
          grid.setAttribute("y2", height - padding.bottom);
          grid.setAttribute("stroke", "#1f2a44");
          grid.setAttribute("stroke-dasharray", "4 4");
          svg.appendChild(grid);
        }


        // Label
        const label = document.createElementNS(svg.namespaceURI, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", height - padding.bottom + 20);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "11");
        label.setAttribute("fill", "#8fa1b3");
        label.textContent = val;
        svg.appendChild(label);
      }

      const legend = document.createElementNS(svg.namespaceURI, "text");
      legend.setAttribute("x", width - padding.right);
      legend.setAttribute("y", padding.top - 10);
      legend.setAttribute("text-anchor", "end");
      legend.setAttribute("fill", "#94a3b8");
      legend.setAttribute("font-size", "11");
      legend.textContent = "● Each point = Time bucket";
      svg.appendChild(legend);



      /* ---------- AXIS TITLES ---------- */
      const yTitle = document.createElementNS(svg.namespaceURI, "text");
      yTitle.setAttribute("x", 16);
      yTitle.setAttribute("y", height / 2);
      yTitle.setAttribute("transform", `rotate(-90 16 ${height / 2})`);
      yTitle.setAttribute("fill", "#94a3b8");
      yTitle.setAttribute("font-size", "12");
      yTitle.textContent = "Avg Processing Time (ms)";
      svg.appendChild(yTitle);

      const xTitle = document.createElementNS(svg.namespaceURI, "text");
      xTitle.setAttribute("x", width / 2);
      xTitle.setAttribute("y", height - 12);
      xTitle.setAttribute("text-anchor", "middle");
      xTitle.setAttribute("fill", "#94a3b8");
      xTitle.setAttribute("font-size", "12");
      xTitle.textContent = "Message Count";
      svg.appendChild(xTitle);

      container.innerHTML = "";
      container.appendChild(svg);

      const xAxis = document.createElementNS(svg.namespaceURI, "line");
      xAxis.setAttribute("x1", padding.left);
      xAxis.setAttribute("y1", height - padding.bottom);
      xAxis.setAttribute("x2", width - padding.right);
      xAxis.setAttribute("y2", height - padding.bottom);
      xAxis.setAttribute("stroke", "#334155");
      svg.appendChild(xAxis);

      const zeroLine = document.createElementNS(svg.namespaceURI, "line");
      zeroLine.setAttribute("x1", padding.left);
      zeroLine.setAttribute("y1", height - padding.bottom);
      zeroLine.setAttribute("x2", width - padding.right);
      zeroLine.setAttribute("y2", height - padding.bottom);
      zeroLine.setAttribute("stroke", "#475569");
      zeroLine.setAttribute("stroke-width", "1.5");
      svg.appendChild(zeroLine);


    }


    // ---- Initial Render + Events
    const rangeEl = document.getElementById("trend-range");
    let hours = Number(rangeEl.value) || 24;

    function refresh() {

      function calculateCompletedProcessingStats(logs) {
        const times = [];

        function parseCpiDate(cpiDate) {
          if (!cpiDate || typeof cpiDate !== "string") return null;

          const match = cpiDate.match(/\/Date\((\d+)\)\//);
          return match ? Number(match[1]) : null;
        }

        logs.forEach(log => {

          if (
            log.Status === "COMPLETED" &&
            log.LogStart &&
            log.LogEnd
          ) {
            const start = parseCpiDate(log.LogStart)
            const end = parseCpiDate(log.LogEnd)

            if (
              start !== null &&
              end !== null &&
              end > start
            ) {
              times.push(end - start);
            }
          }
        });

        if (times.length === 0) {
          return null;
        }

        const min = Math.min(...times);
        const max = Math.max(...times);
        const avg = Math.round(
          times.reduce((a, b) => a + b, 0) / times.length
        );

        return { min, max, avg };
      }

      const stats = calculateCompletedProcessingStats(MPLLogs);
      if (!stats) return;

      function formatDuration(ms) {
        if (ms < 1000) return `${ms} ms`;
        return `${(ms / 1000).toFixed(2)} sec`;
      }

      document.getElementById("Min").textContent = formatDuration(stats.min);
      document.getElementById("Avg").textContent = formatDuration(stats.avg);
      document.getElementById("Max").textContent = formatDuration(stats.max);
      const bucketed = bucketMessages(MPLLogs, hours);
      renderMessagesOverTime("trend-msg-volume", bucketed);
      renderProcessingTimeChart("trend-proc-time", bucketed);
    }

    rangeEl.onchange = e => {
      hours = Number(e.target.value);
      refresh();
    };

    refresh();
  }

  // Ghosted artifcats

  async function fetchGhostedArtifacts() {
    if (!ghostedContent) return;

    ghostedContent.innerHTML = ` <div class="cpi-loader-container">
          <div class="cpi-loader"></div>
          <div style="margin-top:10px;">Analysing Artifacts...Please wait! This could take a minute.</div>
        </div>`;


    async function fetchRuntimeFlows() {
      return new Promise((resolve, reject) => {
        try {
          const currentUrl = window.location.href;
          const tenantUrl = new URL(currentUrl);
          const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

          const deployedApiUrl =
            `${baseUrl}/api/v1/IntegrationRuntimeArtifacts` +
            `?$filter=Type eq 'INTEGRATION_FLOW'` +
            `&$select=Id,Name,Version,DeployedOn,DeployedBy,Type`;

          chrome.runtime.sendMessage(
            {
              type: "FETCH_DEPLOYED_IFLOWS",
              url: deployedApiUrl,
              tenantUrl: currentUrl
            },
            (response) => {
              if (!response?.ok) {
                reject(new Error("Failed to fetch deployed iFlows"));
                return;
              }

              const flows = response.data?.d?.results || [];
              resolve(flows);
            }
          );
        } catch (err) {
          reject(err);
        }
      });
    }

    async function fetchDesigntiimeFlows() {


      function fetchAllPackages() {
        try {
          const tenantUrl = new URL(window.location.href);
          const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

          const apiUrl = `${baseUrl}/odata/1.0/workspace.svc/ContentEntities.ContentPackages`;

          return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
              {
                type: "FETCH_ALL_PACKAGES",
                url: apiUrl,
                tenantUrl: window.location.href
              },
              (response) => {
                if (!response?.ok) {
                  reject(new Error("Error fetching Packages"));
                  return;
                }

                resolve(response.data?.d?.results || []);
              }
            );
          });

        } catch (err) {
          throw err;
        }
      }

      async function fetchAllDesignTimeFlows(packages) {
        const allDesignTimeFlows = [];

        async function fetchDesignTimeIflowsForPackage(packageId) {
          try {
            const tenantUrl = new URL(window.location.href);
            const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

            const apiUrl =
              `${baseUrl}/odata/1.0/workspace.svc/ContentEntities.ContentPackages('${packageId}')/Artifacts`;

            return new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(
                {
                  type: "FETCH_DESIGNTIME_ARTIFACTS",
                  url: apiUrl,
                  tenantUrl: window.location.href
                },
                (response) => {
                  if (!response?.ok) {
                    reject(new Error("Error fetching Designtime IFlows"));
                    return;
                  }

                  resolve(response.data?.d?.results || []);
                }
              );
            });

          } catch (err) {
            throw err;
          }
        }


        for (const pkg of packages) {
          const packageId = pkg.TechnicalName;

          try {
            const flows = await fetchDesignTimeIflowsForPackage(packageId);

            flows.forEach(f => {
              allDesignTimeFlows.push({
                id: f.Name
              });
            });

          } catch (err) {
            console.warn(`Failed for package ${packageId}`, err);
          }
        }

        return allDesignTimeFlows;
      }

      const packages = await fetchAllPackages();
      const allDesignTimeFlows = await fetchAllDesignTimeFlows(packages);
      return allDesignTimeFlows;
    }

    function detectGhostedIflows(runtimeFlows = [], designTimeFlows = []) {
      // Build Designtime ID Set (fast lookup)
      const designTimeIdSet = new Set(
        designTimeFlows
          .map(dt => dt.id)
          .filter(Boolean)
      );

      // Runtime flows not present in designtime = Ghosted
      return runtimeFlows
        .filter(rt => rt.Id && !designTimeIdSet.has(rt.Id))
        .map(rt => ({
          id: rt.Id,
          name: rt.Name || rt.Id,
          deployedOn: rt.DeployedOn || null,
          deployedBy: rt.DeployedBy || null,
          version: rt.Version || "N/A",
          status: "GHOSTED"
        }));
    }

    const runtimeFlows = await fetchRuntimeFlows();
    const designtimeFlows = await fetchDesigntiimeFlows();
    const ghostedIflows = detectGhostedIflows(runtimeFlows, designtimeFlows);
    renderGhostedUI(ghostedIflows);

  }

  function renderGhostedUI(ghosts = []) {


    function exportGhostedArtifactsToExcel() {

      function formatCpiDate(isoDate) {
        if (!isoDate) return "-";

        const date = new Date(isoDate);

        return date.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }).replace(",", "");
      }
     
      const headers = "Name,DeployedOn,DeployedBy,Version";
      const csvRows = ghosts.map(ghost =>
        [
          `"${ghost.name ?? ''}"`,
          `"${formatCpiDate(ghost.deployedOn) ?? ''}"`,
          `"${ghost.deployedBy ?? ''}"`,
          `"${ghost.version ?? ''}"`
        ].join(",")
      );
      const csv = [headers, ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GhostedArtifacts_CloudIntegration.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); 
    }

    ghostedContent.innerHTML = `<div class="ghosted-tab">

    <div class="ghost-summary">
     <span id="ghostCount">0</span> Ghosted (Runtime Only) Artifacts Found  
      <span style="display: flex; align-items: right; cursor:pointer;" title="Export to Excel" id="exportGhostedArtifactsToExcel">
        <img src="${chrome.runtime.getURL('assets/xls.png')}" alt="Export to Excel" style="width:20px; height:20px; display:block;" />
      </span>
     </span>
    </div>
    <div id="ghostList" class="ghost-list"></div>
    </div>
`

    // Bind the export button click event
    const exportBtn = document.getElementById("exportGhostedArtifactsToExcel");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportGhostedArtifactsToExcel);
    }

    const list = document.getElementById("ghostList");
    const count = document.getElementById("ghostCount");

    count.textContent = ghosts.length;
    list.innerHTML = "";

    if (ghosts.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          ✅ No ghosted artifacts found
        </div>
      `;
      return;
    }

    function bindGhostCardClicks() {
      document.querySelectorAll(".ghost-card").forEach(card => {
        card.addEventListener("click", () => {
          const id = card.dataset.id;
          const currentUrl = window.location.href;
          const tenantUrl = new URL(currentUrl);
          const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}/shell/monitoring/Artifacts/%7B%22edge%22:%7B%22runtimeLocationId%22:%22cloudintegration%22%7D,%22artifactId%22:%22`;
          const url = `${baseUrl}${id}%22%7D`;
          window.open(url, "_blank", "noopener,noreferrer");
        });
      });
    }

    ghosts.forEach(f => {

      function formatCpiDate(isoDate) {
        if (!isoDate) return "-";

        const date = new Date(isoDate);

        return date.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }).replace(",", "");
      }

      let deployDate = formatCpiDate(f.deployedOn)

      list.innerHTML += `
        <div class="ghost-card tooltip-wrapper" data-id="${f.id}" style="cursor:pointer;">
          <div class="ghost-header">
               ${f.name}
            <span class="ghost-status">DeployedOn : <b>${deployDate}</span>
            <span class="ghost-status">DeployedBy : <b>${f.deployedBy}</span>
          </div>
          <div class="ghost-meta">
            <div>Version: ${f.version || "-"}</div>
          </div>
          <div class="tooltip">Click to Open & Analyse the criticality of the Artifact and Restore or Delete it!</div>
        </div>
      `;
    });

    bindGhostCardClicks();
  }

  //duplicates & Tests flows

  function fetchDuplicates() {

    if (!duplicatesContent) return;
    duplicatesContent.innerHTML = `
  <div class="duplicates-grid">
  <!-- LEFT: EXISTING DUPLICATES (UNCHANGED) -->
  <div class="duplicates-left">
    <div class="duplicates-summary">
      <div class="summary-item">
        <span class="summary-value" id="dupGroupCount">0</span>
        <span class="summary-label">Duplicate Groups</span>
      </div>
      <div class="summary-item">
        <span class="summary-value" id="dupFlowCount">0</span>
        <span class="summary-label">Total iFlows</span>
      </div>
    </div>
    <div id="duplicatesList" class="duplicates-list"></div>
  </div>

  <!-- RIGHT: TEST IFLOWS -->
  <div class="duplicates-right">
    <div id="testIflowsPanel"></div>
  </div>
</div>

    `

    function findDuplicateIflows(iflows) {
      const map = {};
      iflows.forEach(flow => {
        const normalized = normalizeIflowName(flow.Name);
        if (!map[normalized]) {
          map[normalized] = [];
        }
        map[normalized].push(flow);
      });

      // Only groups with duplicates
      return Object.entries(map)
        .filter(([_, group]) => group.length > 1)
        .map(([baseName, group]) => {
          return {
            baseName,
            count: group.length,
            flows: group.map(f => ({
              id: f.Id,
              name: f.Name,
            }))
          };
        });
    }
    function normalizeIflowName(name) {
      return name
        .toLowerCase()
        .replace(/[_\-]/g, " ")
        .replace(/\b(v|ver|version)\s*\d+\b/g, "")
        .replace(/\bcopy\b/g, "")
        .replace(/\barchive\b/g, "")
        .replace(/\bbackup\b/g, "")
        .replace(/\btest\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    function getSeverity(count) {
      if (count >= 4) return "high";
      if (count >= 3) return "medium";
      return "low";
    }
    function renderDuplicates(duplicateGroups) {
      const list = document.getElementById("duplicatesList");

      let totalFlows = 0;
      duplicateGroups.forEach(g => totalFlows += g.count);

      document.getElementById("dupGroupCount").textContent = duplicateGroups.length;
      document.getElementById("dupFlowCount").textContent = totalFlows;

      list.innerHTML = duplicateGroups.map(group => {
        const severity = getSeverity(group.count);

        return `
          <div class="duplicate-card">
            <div class="duplicate-header">
              <div class="duplicate-title">
                🧬 ${group.baseName}
                <span style="opacity:.6">(${group.count})</span>
              </div>
              <span class="badge ${severity}">
                ${severity.toUpperCase()}
              </span>
            </div>
    
            <div class="duplicate-list">
              ${group.flows.map(f => `
                <div class="duplicate-row">
                  <span class="flow-name">${f.name}</span>
                </div>
              `).join("")}
            </div>
    
            <div class="recommendation">
              ⚠ Recommendation: Keep latest version and archive others
            </div>
          </div>
        `;
      }).join("");
    }
    function renderTestIflows(runtimeIflows) {
      const container = document.getElementById("testIflowsPanel");

      function isTestIflow(name = "") {
        return /(^|[^a-z0-9])test([^a-z0-9]|$)/i.test(name);
      }

      const testFlows = runtimeIflows.filter(f => isTestIflow(f.Name));
      if (!testFlows.length) {
        container.innerHTML = `
          <div class="test-panel">
            <div class="test-header">
              <div class="test-title">🧪 Test iFlows</div>
              <span class="test-badge">0</span>
            </div>
            <div style="opacity:.6;">No test iFlows found</div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="test-panel">
          <div class="test-header">
            <div class="test-title">🧪 Test iFlows</div>
            <span class="test-badge">${testFlows.length}</span>
          </div>
    
          ${testFlows.map(f => `
            <div class="test-row">
              <span>${f.Name}</span>
              <span class="test-badge">TEST</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    try {
      const currentUrl = window.location.href;
      const tenantUrl = new URL(currentUrl);
      const baseUrl = `${tenantUrl.protocol}//${tenantUrl.host}`;

      const deployedApiUrl =
        `${baseUrl}/api/v1/IntegrationRuntimeArtifacts`
        + `?$filter=Type eq 'INTEGRATION_FLOW'`
        + `&$select=Id,Name,Version,DeployedOn,Type`;

      chrome.runtime.sendMessage(
        {
          type: "FETCH_DEPLOYED_IFLOWS",
          url: deployedApiUrl,
          tenantUrl: currentUrl
        },
        async (response) => {
          if (!response?.ok) {
            duplicatesContent.innerHTML = `<div>Please refresh your page and try again!</div>`;
            return;
          }

          const iFlows = response.data?.d?.results || [];
          renderTestIflows(iFlows);
          const duplicates = findDuplicateIflows(iFlows);
          renderDuplicates(duplicates);
        }
      );
    } catch (err) {
      duplicatesContent.innerHTML = `<div>Please refresh your page and try again!</div>`;
    }

  }

  // Favourites

  function fetchFavourites() {
    if (!favouritesContent) return;

    favouritesContent.innerHTML = `
    <div class="fav-container">

  <div class="fav-header">
    ⭐ Favorite iFlows
    <span class="fav-subtitle">"Quick access to frequently used iFlows"</span>
     <input
      type="text"
      id="favSearch"
      placeholder="Search iFlow..."
    />
  </div>

  <div id="favList" class="fav-list"></div>

</div>

`
    const tenant = document.getElementById("tenantName").innerText;
    const STORAGE_KEY = "__CPI_LENS_FAVOURITES__::";

    const key = `${STORAGE_KEY}${tenant}`;

    renderFavourites(key);

    document.getElementById("favSearch").addEventListener("input", e => {
      renderFavourites(key, e.target.value.trim());
    });

  }

  async function renderFavourites(key, searchText = "") {

    function loadFavourites(key) {
      return new Promise(resolve => {
        chrome.storage.local.get([key], result => {
          resolve(result[key] || []);
        });
      });
    }

    function filterFavourites(favourites, searchText) {
      if (!searchText) return favourites;

      const query = searchText.toLowerCase();
      return favourites.filter(fav =>
        fav.name.toLowerCase().includes(query)
      );
    }

    function deleteFavouriteById(id) {
      chrome.storage.local.get([key], (result) => {
        const favs = result[key] || [];

        const updated = favs.filter(f => f.id !== id);

        chrome.storage.local.set({ [key]: updated }, () => {
          renderFavourites(key, searchText);
        });
      });
    }

    const list = document.getElementById("favList");
    list.innerHTML = "";

    const favourites = await loadFavourites(key);
    const filtered = filterFavourites(favourites, searchText);

    if (filtered.length === 0) {
      list.innerHTML = `<div style="opacity:.5;">No favorites added yet. Click the ⭐ (star) icon next to the iFlow name in the Iflow Designer to mark it as a favorite.</div>`;
      return;
    }

    filtered.forEach((fav) => {
      const item = document.createElement("div");
      item.className = "fav-item";

      item.innerHTML = `
        <span class="fav-item-name">${fav.name}</span>
        <button class="fav-delete-btn" title="Remove">🗑️</button>
      `;

      item.addEventListener("click", () => {
        window.open(fav.url, "_blank");
      });

      item.querySelector(".fav-delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteFavouriteById(fav.id);
      });

      list.appendChild(item);
    });
  }

  // Tools
  function renderTools() {
    if (!toolsContent) return;

    toolsContent.innerHTML = `
    <div class="tools-menu">
      <button class="tool-btn active" data-tool="xml">XML Compare</button>
      <button class="tool-btn" data-tool="text">Text Compare</button>
      <button class="tool-btn" data-tool="jsonformatter">Format JSON</button>
      <button class="tool-btn" data-tool="xmlformatter">Format XML</button>
      <button class="tool-btn" data-tool="xmltojson">XML → JSON</button>
      <button class="tool-btn" data-tool="jsontoxml">JSON → XML</button>
      <button class="tool-btn" data-tool="xsd">XSD Generator</button>
      <button class="tool-btn" data-tool="xpath">X-Path</button>
    </div>
  
    <div class="tools-workspace" id="toolsWorkspace"></div>
  `;

    const toolsWorkspace = document.getElementById("toolsWorkspace");

    /* ---------- Tool Switcher ---------- */
    document.querySelectorAll(".tool-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tool-btn")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const tool = btn.dataset.tool;

        switch (tool) {
          case "text":
            renderTextCompare();
            break;

          case "xml":
            renderXmlCompare?.();
            break;

          case "jsonformatter":
            renderJsonFormatter?.();
            break;

          case "xmlformatter":
            renderXmlFormatter?.();
            break;

          case "xmltojson":
            renderXmlToJsonConvertor?.();
            break;

          case "jsontoxml":
            renderJsonToXmlConvertor?.();
            break;

          case "xsd":
            renderXsdGenerator?.();
            break;

          case "xpath":
            renderXpathTester?.();
            break;

          default:
            toolsWorkspace.innerHTML = `<div>Tool not implemented</div>`;
        }
      });
    });

    /* ---------- Default Tool ---------- */
    renderXmlCompare();

  }

  function renderTextCompare() {
    toolsWorkspace.innerHTML = `
        <h3 class="tool-title">Text Compare</h3>
    
        <div class="dual-input">
          <textarea id="textA" placeholder="Paste Text A here..."></textarea>
          <textarea id="textB" placeholder="Paste Text B here..."></textarea>
        </div>
    
        <div class="tool-actions">
          <button id="compareBtn" class="primary-btn">Compare</button>
        </div>
    
        <div id="textDiff" class="diff-output"></div>
      `;

    /* ---------- Core Compare Logic ---------- */
    function compareText(left, right) {
      if (typeof left !== "string" || typeof right !== "string") {
        throw new Error("Text compare expects string inputs");
      }

      const leftLines = left.split("\n");
      const rightLines = right.split("\n");

      const differences = [];
      const max = Math.max(leftLines.length, rightLines.length);

      for (let i = 0; i < max; i++) {
        if (leftLines[i] !== rightLines[i]) {
          differences.push({
            line: i + 1,
            left: leftLines[i] || "",
            right: rightLines[i] || ""
          });
        }
      }

      return {
        identical: differences.length === 0,
        differences
      };
    }

    /* ---------- Render Diff ---------- */
    function renderDiff(result) {
      const output = document.getElementById("textDiff");

      if (result.identical) {
        output.innerHTML = `<div class="diff-success">✅ Texts are identical</div>`;
        return;
      }

      output.innerHTML = result.differences
        .map(
          d => `
          <div class="diff-row">
            <div class="diff-line">Line ${d.line}</div>
            <div class="diff-left">${escapeHtml(d.left)}</div>
            <div class="diff-right">${escapeHtml(d.right)}</div>
          </div>
        `
        )
        .join("");
    }

    /* ---------- Safety ---------- */
    function escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    document.getElementById("compareBtn").addEventListener("click", () => {
      const left = document.getElementById("textA").value;
      const right = document.getElementById("textB").value;

      const diff = compareText(left, right);
      renderDiff(diff);
    });

  }

  function renderXmlCompare() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <h3 class="xmlcmp-title">XML Compare</h3>
    
        <div class="xmlcmp-input-container">
          <textarea id="xmlcmpInputA" class="xmlcmp-textarea" placeholder="XML A"></textarea>
          <textarea id="xmlcmpInputB" class="xmlcmp-textarea" placeholder="XML B"></textarea>
        </div>
    
        <div class="xmlcmp-actions">
          <button id="xmlcmpCompareBtn" class="xmlcmp-btn">Compare XML</button>
        </div>
    
        <div id="xmlcmpDiffResult" class="xmlcmp-diff-container"></div>
      `;

    function escapeXmlHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function formatXmlForCompare(xml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "application/xml");

      // Proper XML error detection
      if (xmlDoc.querySelector("parsererror")) {
        throw new Error("Invalid XML");
      }

      // Serialize back to string
      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(xmlDoc);

      // Pretty print (safe for empty nodes)
      formatted = formatted
        .replace(/></g, ">\n<")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      return formatted;
    }

    function xmlCompareHandler() {
      const xmlA = document.getElementById("xmlcmpInputA").value.trim();
      const xmlB = document.getElementById("xmlcmpInputB").value.trim();
      const output = document.getElementById("xmlcmpDiffResult");

      if (!xmlA || !xmlB) {
        output.innerHTML = `<div class="xmlcmp-error">Both XML inputs are required.</div>`;
        return;
      }

      try {
        const left = formatXmlForCompare(xmlA).split("\n");
        const right = formatXmlForCompare(xmlB).split("\n");

        const max = Math.max(left.length, right.length);
        let html = "";

        for (let i = 0; i < max; i++) {
          const l = left[i] || "";
          const r = right[i] || "";

          if (l !== r) {
            html += `
                <div class="xmlcmp-diff-row xmlcmp-modified">
                  <span class="xmlcmp-line">${i + 1}</span>
                  <span class="xmlcmp-left">${escapeXmlHtml(l)}</span>
                  <span class="xmlcmp-right">${escapeXmlHtml(r)}</span>
                </div>
              `;
          } else {
            html += `
                <div class="xmlcmp-diff-row">
                  <span class="xmlcmp-line">${i + 1}</span>
                  <span class="xmlcmp-same">${escapeXmlHtml(l)}</span>
                </div>
              `;
          }
        }

        output.innerHTML =
          html || `<div class="xmlcmp-success">XMLs are identical ✅</div>`;

      } catch (e) {
        output.innerHTML = `<div class="xmlcmp-error">Invalid XML structure.</div>`;
      }
    }

    document
      .getElementById("xmlcmpCompareBtn")
      .addEventListener("click", xmlCompareHandler);
  }

  function formatXmlForCompare(xml) {
    const padChar = "  ";
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;
    let formatted = "";

    xml = xml.replace(reg, "$1\n$2$3");

    xml.split("\n").forEach(line => {
      let indent = 0;

      if (line.match(/^<\/\w/)) {
        pad--;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      }

      formatted += padChar.repeat(pad) + line + "\n";
      pad += indent;
    });

    return formatted.trim();
  }

   // Show Toast when content is copied to clipboard
   function showToast(message) {
    // Remove existing toast if any
    const existing = document.getElementById("cpi-lens-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "cpi-lens-toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "40px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#333c";
    toast.style.color = "white";
    toast.style.padding = "10px 24px";
    toast.style.borderRadius = "22px";
    toast.style.fontSize = "1rem";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 2px 12px #0003";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    toast.style.zIndex = "2147483647"; // Ensure toast is always on top

    document.body.appendChild(toast);
    // Trigger animate in
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 50);

    // Remove after some time
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 600);
    }, 1600);
  }

  function renderJsonFormatter() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
      <div class="jsonfmt-container">
  
        <div class="jsonfmt-header">
          <h3>JSON Formatter</h3>
          <div class="jsonfmt-actions">
            <button class="jsonfmt-btn primary" id="jsonfmt-format">Format</button>
            <button class="jsonfmt-btn" id="jsonfmt-clear">Clear</button>
            <button class="jsonfmt-btn" id="jsonfmt-copy">Copy</button>
          </div>
        </div>
  
        <div class="jsonfmt-panels">
          <textarea
            id="jsonfmt-input"
            class="jsonfmt-textarea"
            placeholder="Paste JSON here..."
          ></textarea>
  
          <pre
            id="jsonfmt-output"
            class="jsonfmt-output"
          ></pre>
        </div>
  
      </div>
    `;

    const input = document.getElementById("jsonfmt-input");
    const output = document.getElementById("jsonfmt-output");

    document.getElementById("jsonfmt-format").onclick = () => {
      try {
        if (!input.value.trim()) {
          output.textContent = "⚠ Please enter JSON";
          output.classList.add("error");
          return;
        }

        const parsed = JSON.parse(input.value);
        const formatted = JSON.stringify(parsed, null, 2);

        output.classList.remove("error");
        output.innerHTML = highlightJson(formatted);

      } catch (err) {
        output.textContent = `❌ Invalid JSON: ${err.message}`;
        output.classList.add("error");
      }
    };

    document.getElementById("jsonfmt-clear").onclick = () => {
      input.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    document.getElementById("jsonfmt-copy").onclick = () => {
      if (!output.textContent) return;
      navigator.clipboard.writeText(output.textContent);
      showToast("Copied to clipboard! 📋");
    };

    /* 🔹 Syntax highlighting */
    function highlightJson(json) {
      return json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
          /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?/g,
          match => {
            let cls = "number";
            if (/^"/.test(match)) {
              cls = /:$/.test(match) ? "key" : "string";
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return `<span class="jsonfmt-${cls}">${match}</span>`;
          }
        );
    }

  }

  function renderXmlFormatter() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <div class="xmlfmt-container">
    
          <div class="xmlfmt-header">
            <h3>XML Formatter</h3>
            <div class="xmlfmt-actions">
              <button class="xmlfmt-btn primary" id="xmlfmt-format">Format</button>
              <button class="xmlfmt-btn" id="xmlfmt-clear">Clear</button>
              <button class="xmlfmt-btn" id="xmlfmt-copy">Copy</button>
            </div>
          </div>
    
          <div class="xmlfmt-panels">
            <textarea
              id="xmlfmt-input"
              class="xmlfmt-textarea"
              placeholder="Paste XML here..."
            ></textarea>
    
            <pre
              id="xmlfmt-output"
              class="xmlfmt-output"
            ></pre>
          </div>
    
        </div>
      `;

    const input = document.getElementById("xmlfmt-input");
    const output = document.getElementById("xmlfmt-output");

    /* ---------------- XML FORMATTER CORE ---------------- */

    function formatXml(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      // Robust XML error detection
      if (xmlDoc.documentElement.nodeName === "parsererror") {
        throw new Error("Invalid XML");
      }

      const xsltString = `
          <xsl:stylesheet version="1.0"
            xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
            <xsl:output method="xml" indent="yes"/>
            <xsl:strip-space elements="*"/>
    
            <xsl:template match="@*|node()">
              <xsl:copy>
                <xsl:apply-templates select="@*|node()"/>
              </xsl:copy>
            </xsl:template>
          </xsl:stylesheet>
        `;

      const xsltDoc = parser.parseFromString(xsltString, "application/xml");
      const processor = new XSLTProcessor();
      processor.importStylesheet(xsltDoc);

      const resultDoc = processor.transformToDocument(xmlDoc);
      return new XMLSerializer().serializeToString(resultDoc);
    }

    /* ---------------- BUTTON HANDLERS ---------------- */

    document.getElementById("xmlfmt-format").onclick = () => {
      try {
        const xmlText = input.value.trim();

        if (!xmlText) {
          output.textContent = "⚠ Please enter XML";
          output.classList.add("error");
          return;
        }

        const formattedXml = formatXml(xmlText);

        output.classList.remove("error");
        output.textContent = formattedXml;

      } catch (err) {
        output.textContent = `❌ ${err.message}`;
        output.classList.add("error");
      }
    };

    document.getElementById("xmlfmt-clear").onclick = () => {
      input.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    document.getElementById("xmlfmt-copy").onclick = () => {
      if (!output.textContent) return;
      navigator.clipboard.writeText(output.textContent);
      showToast("Copied to clipboard! 📋");
    };
  }

  function renderJsonToXmlConvertor() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <div class="jsonxml-container">
    
          <div class="jsonxml-header">
            <h3>JSON → XML Converter</h3>
            <div class="jsonxml-actions">
              <button class="jsonxml-btn primary" id="jsonxml-convert">Convert</button>
              <button class="jsonxml-btn" id="jsonxml-clear">Clear</button>
              <button class="jsonxml-btn" id="jsonxml-copy">Copy</button>
            </div>
          </div>
    
          <div class="jsonxml-panels">
            <textarea
              id="jsonxml-input"
              class="jsonxml-textarea"
              placeholder="Paste JSON here..."
            ></textarea>
    
            <pre
              id="jsonxml-output"
              class="jsonxml-output"
            ></pre>
          </div>
    
        </div>
      `;

    const input = document.getElementById("jsonxml-input");
    const output = document.getElementById("jsonxml-output");

    /* ---------------- JSON → XML CORE ---------------- */

    function jsonToXml(obj, indent = "") {
      let xml = "";

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];

        if (value === null || value === "") {
          xml += `${indent}<${key}></${key}>\n`;
        }
        else if (Array.isArray(value)) {
          value.forEach(item => {
            xml += `${indent}<${key}>\n`;
            xml += jsonToXml(item, indent + "  ");
            xml += `${indent}</${key}>\n`;
          });
        }
        else if (typeof value === "object") {
          xml += `${indent}<${key}>\n`;
          xml += jsonToXml(value, indent + "  ");
          xml += `${indent}</${key}>\n`;
        }
        else {
          xml += `${indent}<${key}>${escapeXml(value)}</${key}>\n`;
        }
      }

      return xml;
    }

    function escapeXml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    /* ---------------- BUTTON HANDLERS ---------------- */

    document.getElementById("jsonxml-convert").onclick = () => {
      try {
        const jsonText = input.value.trim();

        if (!jsonText) {
          output.textContent = "⚠ Please enter JSON";
          output.classList.add("error");
          return;
        }

        const jsonObj = JSON.parse(jsonText);

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n`;
        xml += jsonToXml(jsonObj, "  ");
        xml += `</root>`;

        output.classList.remove("error");
        output.textContent = xml;

      } catch (err) {
        output.textContent = `❌ Invalid JSON: ${err.message}`;
        output.classList.add("error");
      }
    };

    document.getElementById("jsonxml-clear").onclick = () => {
      input.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    document.getElementById("jsonxml-copy").onclick = () => {
      if (!output.textContent) return;
      navigator.clipboard.writeText(output.textContent);
      showToast("Copied to clipboard! 📋");
    };
  }

  function renderXmlToJsonConvertor() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <div class="xmljson-container">
    
          <div class="xmljson-header">
            <h3>XML → JSON Converter</h3>
            <div class="xmljson-actions">
              <button class="xmljson-btn primary" id="xmljson-convert">Convert</button>
              <button class="xmljson-btn" id="xmljson-clear">Clear</button>
              <button class="xmljson-btn" id="xmljson-copy">Copy</button>
            </div>
          </div>
    
          <div class="xmljson-panels">
            <textarea
              id="xmljson-input"
              class="xmljson-textarea"
              placeholder="Paste XML here..."
            ></textarea>
    
            <pre
              id="xmljson-output"
              class="xmljson-output"
            ></pre>
          </div>
    
        </div>
      `;

    const input = document.getElementById("xmljson-input");
    const output = document.getElementById("xmljson-output");

    /* ---------------- XML → JSON CORE ---------------- */

    function xmlNodeToJson(node) {
      // ELEMENT NODE
      if (node.nodeType === 1) {
        const obj = {};
        let hasElementChildren = false;
        let textValue = "";

        Array.from(node.childNodes).forEach(child => {
          // TEXT NODE
          if (child.nodeType === 3) {
            const text = child.nodeValue.trim();
            if (text) textValue += text;
          }

          // ELEMENT NODE
          if (child.nodeType === 1) {
            hasElementChildren = true;
            const childObj = xmlNodeToJson(child);
            const name = child.nodeName;

            if (obj[name]) {
              if (!Array.isArray(obj[name])) {
                obj[name] = [obj[name]];
              }
              obj[name].push(childObj);
            } else {
              obj[name] = childObj;
            }
          }
        });

        // 🔑 Decision logic
        if (!hasElementChildren) {
          return textValue; // string or empty string
        }

        return obj;
      }

      return null;
    }


    function xmlToJson(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML");
      }

      const root = xmlDoc.documentElement;
      const result = {};
      result[root.nodeName] = xmlNodeToJson(root);
      return result;
    }

    /* ---------------- BUTTON HANDLERS ---------------- */

    document.getElementById("xmljson-convert").onclick = () => {
      try {
        if (!input.value.trim()) {
          output.textContent = "⚠ Please enter XML";
          output.classList.add("error");
          return;
        }

        const jsonObj = xmlToJson(input.value);
        output.classList.remove("error");
        output.textContent = JSON.stringify(jsonObj, null, 2);

      } catch (err) {
        output.textContent = `❌ ${err.message}`;
        output.classList.add("error");
      }
    };

    document.getElementById("xmljson-clear").onclick = () => {
      input.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    document.getElementById("xmljson-copy").onclick = () => {
      if (!output.textContent) return;
      navigator.clipboard.writeText(output.textContent);
      showToast("Copied to clipboard! 📋");
    };
  }

  function renderXsdGenerator() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <div class="xsdgen-container">
    
          <div class="xsdgen-header">
            <h3>XSD Generator (from XML)</h3>
            <div class="xsdgen-actions">
              <button class="xsdgen-btn primary" id="xsdgen-generate">Generate XSD</button>
              <button class="xsdgen-btn" id="xsdgen-clear">Clear</button>
              <button class="xsdgen-btn" id="xsdgen-copy">Copy</button>
            </div>
          </div>
    
          <div class="xsdgen-panels">
            <textarea
              id="xsdgen-input"
              class="xsdgen-textarea"
              placeholder="Paste XML here..."
            ></textarea>
    
            <pre
              id="xsdgen-output"
              class="xsdgen-output"
            ></pre>
          </div>
    
        </div>
      `;

    const input = document.getElementById("xsdgen-input");
    const output = document.getElementById("xsdgen-output");

    // ---------- CORE LOGIC ----------
    function inferXsdType(value) {
      if (/^\d+$/.test(value)) return "xs:integer";
      if (/^\d+\.\d+$/.test(value)) return "xs:decimal";
      if (/^(true|false)$/i.test(value)) return "xs:boolean";
      return "xs:string";
    }

    function processNode(node, indent = "  ") {
      const children = Array.from(node.children);
      const childGroups = {};

      children.forEach(child => {
        const name = child.nodeName;
        childGroups[name] = childGroups[name] || [];
        childGroups[name].push(child);
      });

      if (children.length === 0) {
        const value = node.textContent.trim();
        const type = inferXsdType(value);
        return `${indent}<xs:element name="${node.nodeName}" type="${type}"/>`;
      }

      let xsd = `${indent}<xs:element name="${node.nodeName}">\n`;
      xsd += `${indent}  <xs:complexType>\n`;
      xsd += `${indent}    <xs:sequence>\n`;

      Object.keys(childGroups).forEach(key => {
        const group = childGroups[key];
        const child = group[0];
        const occurs =
          group.length > 1
            ? ` minOccurs="0" maxOccurs="unbounded"`
            : "";

        if (child.children.length === 0) {
          const value = child.textContent.trim();
          const type = inferXsdType(value);
          xsd += `${indent}      <xs:element name="${key}" type="${type}"${occurs}/>\n`;
        } else {
          xsd += `${indent}      <xs:element name="${key}"${occurs}>\n`;
          xsd += `${indent}        <xs:complexType>\n`;
          xsd += `${indent}          <xs:sequence>\n`;
          xsd += processNode(child, indent + "            ") + "\n";
          xsd += `${indent}          </xs:sequence>\n`;
          xsd += `${indent}        </xs:complexType>\n`;
          xsd += `${indent}      </xs:element>\n`;
        }
      });

      xsd += `${indent}    </xs:sequence>\n`;
      xsd += `${indent}  </xs:complexType>\n`;
      xsd += `${indent}</xs:element>`;

      return xsd;
    }

    function generateXsd(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML");
      }

      const root = xmlDoc.documentElement;

      let xsd = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xsd += `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n`;
      xsd += processNode(root) + "\n";
      xsd += `</xs:schema>`;

      return xsd;
    }

    // ---------- EVENTS ----------
    document.getElementById("xsdgen-generate").onclick = () => {
      try {
        if (!input.value.trim()) {
          output.textContent = "⚠ Please provide XML input";
          output.classList.add("error");
          return;
        }

        const xsd = generateXsd(input.value);
        output.classList.remove("error");
        output.textContent = xsd;

      } catch (err) {
        output.textContent = `❌ ${err.message}`;
        output.classList.add("error");
      }
    };

    document.getElementById("xsdgen-clear").onclick = () => {
      input.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    document.getElementById("xsdgen-copy").onclick = () => {
      if (!output.textContent) return;
      navigator.clipboard.writeText(output.textContent);
      showToast("Copied to clipboard! 📋");
    };
  }

  function renderXpathTester() {
    const toolsWorkspace = document.getElementById("toolsWorkspace");

    toolsWorkspace.innerHTML = `
        <div class="xpath-container">
          <div class="xpath-header">
            <h3>X-Path Tester</h3>
            <div class="xpath-actions">
              <button class="xpath-btn primary" id="xpath-test">Test</button>
              <button class="xpath-btn" id="xpath-clear">Clear</button>
              <button class="xpath-btn" id="xpath-copy">Copy</button>
            </div>
          </div>
          <div class="xpath-panels">
            <textarea
              id="xpath-xml-input"
              class="xpath-textarea"
              placeholder="Paste XML here..."
            ></textarea>
            <input
              id="xpath-expression-input"
              class="xpath-input"
              type="text"
              placeholder="Enter XPath here e.g. //foo/bar"
              style="margin:8px 0 0 0;width:100%;font-size:1em;padding:5px;"
            />
            <pre
              id="xpath-output"
              class="xpath-output"
            ></pre>
          </div>
        </div>
      `;

    const xmlInput = document.getElementById("xpath-xml-input");
    const xpathInput = document.getElementById("xpath-expression-input");
    const output = document.getElementById("xpath-output");
    const testBtn = document.getElementById("xpath-test");
    const clearBtn = document.getElementById("xpath-clear");
    const copyBtn = document.getElementById("xpath-copy");

    // ---------- CORE LOGIC ----------
    function testXpath(xmlStr, xpathExpr) {
      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML provided.");
      }

      // Evaluate XPath
      let resultStr = "";
      try {
        // Always use UNORDERED_NODE_ITERATOR_TYPE to get explicit node set rather than relying on implicit conversion
        const nodesSnapshot = xmlDoc.evaluate(xpathExpr, xmlDoc, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        let node = nodesSnapshot.iterateNext();
        if (!node) {
          resultStr = "(No results)";
        } else {
          // If there are multiple nodes, pick the FIRST occurring one that is not blank when trimmed.
          let pickedValue = "";
          while (node) {
            let value = "";
            if (node.nodeType === Node.ATTRIBUTE_NODE) {
              value = node.nodeValue || "";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              value = (node.textContent ?? "").trim();
            } else if (node.nodeType === Node.TEXT_NODE) {
              value = (node.nodeValue ?? "").trim();
            } else {
              value = (node.textContent ?? "").trim();
            }
            if (value.length > 0) {
              pickedValue = value;
              break;
            }
            node = nodesSnapshot.iterateNext();
          }
          // If no non-empty value found, fall back to first node's raw value (could be blank)
          if (!pickedValue) {
            // If no non-empty, rewind and use first node's raw textContent or value
            node = nodesSnapshot.iterateNext();
            if (node) {
              if (node.nodeType === Node.ATTRIBUTE_NODE) {
                pickedValue = node.nodeValue || "";
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                pickedValue = (node.textContent ?? "");
              } else if (node.nodeType === Node.TEXT_NODE) {
                pickedValue = (node.nodeValue ?? "");
              } else {
                pickedValue = (node.textContent ?? "");
              }
            }
          }
          resultStr = pickedValue !== undefined ? pickedValue : "(No results)";
        }
      } catch (err) {
        throw new Error("Invalid XPath: " + err.message);
      }

      return resultStr;
    }

    // ---------- EVENTS ----------
    testBtn.onclick = () => {
      output.classList.remove("error");
      output.textContent = "";
      const xml = xmlInput.value.trim();
      const xpath = xpathInput.value.trim();
      if (!xml) {
        output.textContent = "⚠ Please provide XML input";
        output.classList.add("error");
        return;
      }
      if (!xpath) {
        output.textContent = "⚠ Please enter an XPath expression";
        output.classList.add("error");
        return;
      }
      try {
        const value = testXpath(xml, xpath);
        output.textContent = value || "(No results)";
      } catch (err) {
        output.textContent = "❌ " + err.message;
        output.classList.add("error");
      }
    };

    clearBtn.onclick = () => {
      xmlInput.value = "";
      xpathInput.value = "";
      output.textContent = "";
      output.classList.remove("error");
    };

    copyBtn.onclick = () => {
      if (!xpathInput.value.trim()) return;
      navigator.clipboard.writeText(xpathInput.value.trim());
      showToast("XPath copied to clipboard! 📋");
    };
  }

  document.body.appendChild(overlay);

  /* Close button */
  overlay.querySelector(".close-btn").onclick = () => {
    overlay.style.animation = "cpiFadeOut 0.2s ease";
    setTimeout(() => overlay.remove(), 200);
  };

}