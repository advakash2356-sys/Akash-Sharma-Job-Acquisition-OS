# Job Acquisition OS Autofill (beta)

Chrome extension (Manifest V3). Fills job application forms on Workday, Greenhouse, Lever, iCIMS, Taleo, SuccessFactors and Naukri from your JAOS profile file. **It never submits.** You check every field and press Submit yourself.

Install for testing: `chrome://extensions` → Developer mode → Load unpacked → pick this folder (or unzip `jaos-autofill.zip`).

1. In Job Acquisition OS, Settings → "Download profile for the extension".
2. In the extension popup, "Import profile file".
3. On an application form, "Fill this page". Filled fields get a yellow outline.

Privacy: permissions are `activeTab`, `scripting`, `storage` only. It runs on a page only when you click, stores the profile in `chrome.storage.local`, and sends nothing anywhere.
Limits: fields inside cross-origin iframes (some Greenhouse embeds, iCIMS) are not filled; open the form in its own tab. Dropdowns, file uploads, and screening, EEO and consent questions are left for you.

Built with Akash Sync Agent. Original code, MIT.
