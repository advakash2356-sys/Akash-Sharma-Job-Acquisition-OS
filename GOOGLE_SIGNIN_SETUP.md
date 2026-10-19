# Sign in with Google setup (free, Google Identity Services)

Optional. Without these settings the app runs in guest mode and the sign-in button is disabled.

**What this does and does not do:** the app verifies the user's Google identity on the server and then keeps their data in the browser's local storage under their Google account id. There are no server-side sessions and no cloud storage, so data does not sync across devices. It separates accounts on one browser; it is not access control against someone with access to that browser.

## Steps (Google Cloud Console, ~10 minutes)
1. Open https://console.cloud.google.com and create a project (or pick one).
2. **APIs & Services > OAuth consent screen** (shown as *Google Auth Platform > Branding/Audience* in newer consoles):
   - User type **External**, app name (e.g. Momentum), support email and developer contact email, **Save**.
   - Scopes: the defaults (`openid`, `email`, `profile`) are enough; no sensitive scopes.
   - Publishing status: **In production** (so anyone can sign in), or keep **Testing** and add yourself under *Test users*.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type: **Web application**, any name.
   - **Authorized JavaScript origins** (add each, no trailing slash, no path):
     - `https://akash-sharma-job-acquisition-os.vercel.app`
     - `http://localhost:5173`
     - `http://localhost:3000` (this app's dev server port)
   - Authorized redirect URIs: leave empty (not used by the button flow).
   - **Create**, then copy the **Client ID** (looks like `123456-abc.apps.googleusercontent.com`). The client secret is not needed.
4. In **Vercel > Project > Settings > Environment Variables** add for Production (and Preview if wanted):

   | Name | Value |
   |---|---|
   | `VITE_GOOGLE_CLIENT_ID` | the Client ID (used by the browser, read at build time) |
   | `GOOGLE_CLIENT_ID` | the same Client ID (used by the server to check the token's audience) |

5. **Redeploy** (Vite reads `VITE_*` at build time).
6. Open the site > Settings > the Google button appears under Account.

## Troubleshooting
- Button disabled: `VITE_GOOGLE_CLIENT_ID` was missing at build time; add it and redeploy.
- "Error 400: origin_mismatch" or no button: add the exact origin in step 3.
- "Google sign-in is not configured on this server": `GOOGLE_CLIENT_ID` is missing in Vercel.
- Preview deployments have different URLs; add each origin you want to test, or test on production.
