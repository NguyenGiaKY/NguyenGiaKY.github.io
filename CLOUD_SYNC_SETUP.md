# IELTS website — Google sign-in & cross-device progress

**Status:** The account/sync interface is installed but **disabled until Firebase is connected**. This is intentional: GitHub Pages is static and cannot securely store accounts by itself.

## What the owner needs to do once

1. Open [Firebase Console](https://console.firebase.google.com/) and create a project you control.
2. In **Project settings > General > Your apps**, add a **Web app** and copy the **firebaseConfig object** (public browser-side identifiers). Do **not** copy a service-account private key, OAuth client secret or Admin SDK JSON.
3. In **Authentication > Sign-in method**, enable **Google** sign-in. In **Authentication > Settings > Authorized domains**, add `nguyengiaky.github.io`. If another custom domain is used, add that too.
4. In **Build > Firestore Database**, create a database. Choose a suitable database region and choose secure production rules.
5. Paste the **entire contents of [firestore.rules](./firestore.rules)** into **Firestore Database > Rules**, then publish. Rules restrict reads/writes to the account whose UID owns the records. Do not use open `allow read, write: if true` rules.
6. Edit **firebase-config.js** so `window.GK_FIREBASE_CONFIG` contains the public web app config. GitHub Pages deployment will normally update shortly after the commit.
7. On the Mac, open the site and choose **Save across devices → Continue with Google → Upload device progress to cloud**. Wait until the status says **Progress synced**.
8. On the phone, open **https://nguyengiaky.github.io/** with the **same Google account** and select **Load updated cloud progress**. The page reloads, restoring the recorded progress.

## What is synchronized

- Existing daily learning progress and saved vocabulary from `ielts100_online`
- The 81 IELTS tasks / progress records
- Foundation (original lessons, sentence lab, visual A0 and word relationships)
- Core Skills Lab and IELTS Question Types
- Mock Tests, Listening technique results, Vocabulary Review, Error Lab
- Reading highlights, Writing Task 1 draft

These records are uploaded **only after sign-in and explicit first-time selection**. The site does not upload AI API endpoints, passwords, dictionary lookup caches, voice preferences, or raw audio/video recordings. Some older browser-only speaking drafts and browser-specific preferences are not included.

## Protecting existing work

- When cloud is empty, **Upload device progress to cloud** sends existing progress without deleting it.
- If both devices have different progress, syncing pauses and asks you to choose. Choose carefully: replacing cloud progress can overwrite work on the other device.
- You can download **separate cloud/device backup JSON files** before choosing.
- The site tries to save a local backup when replacing either copy. Signing out **keeps** the local study data on that device.
- Auto-sync checks for changed supported local data about every **12 seconds while the page is active**; it checks for other-device changes when returning to the page (throttled) or selecting **Check other device**.
- With no internet, learning remains local; the site does not claim sync succeeded.
- Keep only personal non-sensitive study content in notes. Anyone with access to an unlocked shared device may see the locally saved study progress even after signing out.

## Limits and validation

- Each synced group is a separate Firestore document under `users/{uid}/learningProgress/{key}`.
- A 400 KB per-group client limit avoids hitting Firestore's one-document size limit. Extremely large saved content needs a dedicated chunking migration rather than being silently dropped.
- Updates use Firestore transactions comparing the previous cloud value to prevent silent overwrites on concurrent edits. If there is a conflict, the site pauses and requires a decision.
- Google sign-in uses a popup; some mobile browser popup restrictions may require adjusting browser permissions, and OAuth authorized domains must be configured correctly.
- Firestore free quotas apply. Consult the current Firebase pricing page for limits and costs.
- **This feature has not been tested against a real Firebase project in this repo yet**, because no Firebase config is present. Validate sign-in, Firestore rules and cross-device restore on real devices after setup.

## Privacy and access

The Firestore rules check `request.auth.uid == uid` on every document operation. Authentication is handled by Firebase; the site does not handle passwords itself. Firebase's public client `apiKey` is not a service-account credential, but **security rules and authorized origins are mandatory**.

**Do not share** Firebase service-account JSON, private keys, OAuth client secrets or any account passwords in chat or commit them to the public repository.
