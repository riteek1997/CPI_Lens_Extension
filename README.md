# CPI_Lens_Extension

-Smart Observability and analytics for SAP CPI (Integration Suite) iFlows. 

CPI Lens is an open-source browser extension designed to enhance productivity, visibility, and operational efficiency for SAP CPI (Integration Suite) developers and support teams.

Working with SAP CPI often involves repetitive navigation, limited runtime insights, and frequent context switching between tools. CPI Lens addresses these challenges by bringing *intuitive analytics, runtime insights, and developer utilities directly into the CPI UI*.

# Data & Privacy

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
- Finding failed or idle iFlows
- Tracking message processing trends
- Managing duplicates and test artifacts
- Switching between external tools for formatting and schema work

CPI Lens reduces this friction by surfacing *critical information instantly*, helping teams focus on what truly matters.

---

# ✨ Key Features

### 📊 Intuitive Analytics
- High-level insights into tenant usage and activity
- Helps understand system behavior quickly

### ❌ Failures
- Quickly identify failed iFlows
- Faster analysis during incident handling

### ⭐ Favourites
- Bookmark important iFlows
- One-click access to business-critical integrations

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
- Spot anomalies, spikes, or recurring patterns early

### 🧰 Built-in Tools
- XML / JSON formatters
- Payload converters
- XSD generator
- No need to leave the CPI UI
  
# Installation 

### Option 1: Install directly from the Microsoft Store (Recommended)
   Store Link: will be updated soon ( Updates will be installed automatically )

### Option 2: Developer Mode
   - Clone or download this repository.
   - Open Google Chrome or Microsoft Edge.
   - Navigate to:
   - edge://extensions/ (Edge) or chrome://extensions/ (Chrome)
   - Enable Developer mode
   - Click Load unpacked.
   - Select the root folder of the cloned/downloaded repository.
   - ✅ CPI Lens is now installed and ready to use.

# Usage 
  Open your browser (Chrome/Edge)
  Log in to the SAP Integration Suite tenant.
  Once logged in, the CPI Lens icon will appear in the bottom right corner as shown in the below image.
  
  <img width="1913" height="866" alt="image" src="https://github.com/user-attachments/assets/a250e458-3efa-439f-b727-6427331bac5a" />

  Click to open the Overlay, where you will be able to access all features. 
  CPI Lens is available in Light and Dark Mode.
  
  Light Mode:
  
  <img width="1918" height="870" alt="Screenshot 2026-01-20 111751" src="https://github.com/user-attachments/assets/d612bae9-10cc-4b12-a6ab-1e917e232645" />

  Dark Mode :
  
  <img width="1913" height="865" alt="Screenshot 2026-01-20 111814" src="https://github.com/user-attachments/assets/4d749cf0-2fc1-43f9-8d24-6371c6d4c957" />

  Favourites :
  
  <img width="1902" height="870" alt="image" src="https://github.com/user-attachments/assets/0953cdbc-e887-444b-82e7-5dd9c534e9ce" />

  Trends:
  
  <img width="1902" height="862" alt="Screenshot 2026-01-20 111854" src="https://github.com/user-attachments/assets/057084fc-15a7-45bd-8212-93ad99982398" />

  Tools:

  <img width="1912" height="872" alt="image" src="https://github.com/user-attachments/assets/f495c70e-8e8d-4f91-86a4-e6383486b588" />


# Changelog
### v1.0.0 – First Public Release

🧭 Quick tenant identification with clear visual indicators

📊 Message processing analytics (Success, Failed, Processing, Escalated)

📈 Message volume trends for fast runtime insights

⭐ Favorite iFlows for quick access

👻 Ghosted artifacts detection

💤 Idle iflows detection

⏱️ Cert/keys expiry tracking

🛠️ Built-in utilities (formatters, converters, schema tools)


# License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

