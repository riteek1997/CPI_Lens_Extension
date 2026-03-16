# CPI_Lens_Extension

-Smart Observability, analytics and productivity tools for SAP CPI (Integration Suite) iFlows. 

CPI Lens is a browser extension designed to enhance productivity, visibility, and operational efficiency for SAP CPI (Integration Suite) developers and support teams.

Working with SAP CPI often involves repetitive navigation, limited runtime insights, and frequent context switching between tools. CPI Lens addresses these challenges by bringing *intuitive analytics, runtime insights, and developer utilities directly into the CPI UI*.

# 🔒 Data & Privacy

CPI Lens is designed with privacy and security as first-class principles.
 
 - CPI Lens does not collect, store, or transmit any user credentials.
 - All data processing happens locally within the browser.
 - No SAP CPI data is sent to external servers or third-party services.
 - The extension does not track user activity and does not use analytics, telemetry, or advertising scripts.
 - CPI Lens does not modify, persist, or write back any data to SAP systems.
 - No personal data is collected, shared, or sold.
 - No cookies or persistent identifiers are used outside of optional local browser storage for user preferences.
CPI Lens operates strictly as a read-only enhancement layer to improve visibility and usability within the SAP CPI user interface.

## 🚀 Why CPI Lens?

SAP CPI is powerful, but daily development and support tasks can be time-consuming:
- Finding "ghosted" or idle iFlows
- Tracking message processing trends
- Managing duplicates and test artifacts
- Switching between external tools for formatting and schema work

CPI Lens reduces this friction by surfacing *critical information instantly*, helping teams focus on what truly matters.

---

# ✨ Key Features

### 📊 Intuitive Analytics
- High-level insights into tenant usage and activities (message processing)
- Helps understand system behavior quickly

### ❌ Failures
- Quickly identify failed iFlows
- Faster analysis during incident handling

### ⭐ Favourites
- Bookmark important iFlows
- One-click access to business-critical integrations
- Quick message Summery

### 👻Ghosted Artifacts
- Identify iFlows that exist only in runtime but have no corresponding design-time artifact available for updates.

### 💤 Idle iFlows
- Detect unused or inactive integrations
- Improve tenant cleanliness and governance

### 🧪 Duplicates & Test iFlows
- Identify duplicate or test artifacts easily
- Avoid confusion and reduce risk in productive tenants

### 📈 Trends (MPL)
- Message Processing Log (MPL) trends
- Top 3 Consumer Iflows
- 24h rolling message heatmap
- Spot anomalies, spikes, or recurring patterns early

### 🧪 Simulators
The Simulators feature allows you to replicate, validate, and troubleshoot scenarios in a safe environment before deployment.
- Test integration flow steps with custom payloads
- Simulate processing without affecting real data
- Validate XSLT mappings, value mapping (csv import) and groovy scripts
- Preview output and debug issues interactively

### 🧰 Built-in Tools
- XML / JSON formatters
- Payload converters (XML <-> JSON)
- XSD generator
- X-Path Picker & Tester
- Technical Specification generator
- No need to leave the CPI UI
  
# Installation 

### Install directly from the Chrome Web Store or Microsoft Edge Add-on 
   Chrome Web Store: https://chromewebstore.google.com/detail/cpi-lens-sap-integration/hojcibdjgfibcpfkcgcepblnmmepinhh 
   Edge Add-On: https://microsoftedge.microsoft.com/addons/detail/cpi-lens-sap-integration/jccgihhnjabampjlacooeejjmcbbkgjf

   - Updates will be installed automatically.
   
# Usage 
  Open your browser (Chrome/Edge)
  Log in to the SAP Integration Suite tenant.
  Once logged in, the CPI Lens icon will appear in the bottom-right corner, as shown in the image below.
  
  ![CPI Lens Usage](images/home.png)

  Click to open the Overlay, where you will be able to access all features. 
  CPI Lens is available in Light and Dark Mode.
  
  Light Mode:
  
  ![CPI Lens Usage](images/lightmode.png)

  Dark Mode :
  
  ![CPI Lens Usage](images/darkmode.png)

  Favourites :
  
  ![CPI Lens Usage](images/fav.png)
  Trends:
  
  ![CPI Lens Usage](images/trends.png)

  Tools:

  ![CPI Lens Usage](images/tools.png)


# Changelog

### v2.0.0
- [Feature] Top 3 Consumer IFlows
- [Feature] Value mapping Simulator with CSV import
- [Feature] 24h rolling Heatmap for completed messeges
- [Feature] Annoucement panal with version history
- [Enhacement] Namespace support for XPath picker/tester
- [bug] XSLT Simulator bug fix

### v1.3.0
- [Feature] Technical Specification generator
- [Feature] Quick Message Summery for favorites
- [Enhancement] UI improvement for responsiveness across screen sizes

### v1.2.1 
- [Enhancement] Message Processing Logs Improvement
- [Enhancement] UI Enhancements Across Built-in Tools
  
### v1.2.0 
- [Feature] Groovy Script Simulator
- [Feature] XSLT Simulator
- [Feature] X-Path Extractor/Picker
- [Enhancement] Idle IFlow range update for active, At Risk and idle categories
  
### v1.1.0 
- [Feature] Environment Badge (Trail/Dev/Qa/Prod)
- [Feature] Excel Export for Runtime, Ghosted, Idle iFlows
- [Feature] X-Path Tester
- [Feature] Failure Messages- Group By Filter
- [Enhancement] Expiry-based sorting for Cert/Keys
- [Feature] iFlow health insights ( counts for - Active, At risk, idle iFlows)

### v1.0.0 – First Public Release

🧭 Quick tenant identification with clear visual indicators

📊 Message processing analytics (Success, Failed, Processing, Escalated)

📈 Message volume trends for fast runtime insights

⭐ Favorite iFlows for quick access

👻 Ghosted artifacts detection

💤 Idle iflows detection

⏱️ Cert/keys expiry tracking

🛠️ Built-in utilities (formatters, converters, schema tools)


