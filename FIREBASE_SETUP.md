# Google sign-in setup (Firebase Authentication, free)

Sign-in is optional. Without these settings the app runs in guest mode and the "Sign in with Google" button is disabled. This app uses **Authentication only**: no Firestore, no Firebase database, so there are no Firestore rules to write. User data stays in the browser's local storage, separated per account id.

## Steps (about 5 minutes, done in the Firebase console)

1. Go to https://console.firebase.google.com and click **Add project** (any name; Google Analytics can be off).
2. In the project, open **Build > Authentication** and click **Get started**.
3. **Sign-in method** tab > **Google** > **Enable**. Choose a support email and **Save**.
4. **Settings** tab > **Authorized domains** > **Add domain** and add:
   - `akash-sharma-job-acquisition-os.vercel.app` (production)
   - any Vercel preview domain you want to test on (preview URLs change per deployment)
   - `localhost` is already allowed for local testing.
5. Project settings (gear icon) > **Your apps** > **Add app** > Web (`</>`). Register it and copy the config values.
6. In **Vercel** > the project > **Settings > Environment Variables**, add these for Production (and Preview if wanted):

   | Name | Value from the Firebase config |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

   (These web config values are not secrets; they are public identifiers by design.)
7. **Redeploy** the project (Vite reads `VITE_*` values at build time).
8. Open the site > Settings > **Sign in with Google**.

## If you later add Firestore sync
Not implemented today. If added, use rules so each user can only read and write their own document:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Troubleshooting
- "This domain is not authorised": add the domain in step 4.
- Popup blocked: allow popups for the site.
- Button still disabled: the four `VITE_FIREBASE_*` variables are missing at build time; add them and redeploy.
