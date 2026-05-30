## Feature Expansion Plan for PhishVision AI

### 1. Authentication & User Accounts
- Email/password + Google OAuth signup and login
- Profiles table with display name, avatar, and preferences
- RLS-secured so users only see their own data
- Enables every feature below

### 2. Personal Dashboard
- Per-user scan history (migrating from global to user-scoped)
- Saved/bookmarked scans with notes
- Weekly threat summary email (optional)
- Settings: auto-scan preference, notification toggle, default language

### 3. Public Threat Feed
- A live stream of recently detected phishing URLs (anonymized)
- Community "confirm threat" voting to crowd-source accuracy
- Trending threats section with heat map by region/time
- Real-time updates via Supabase Realtime

### 4. Bulk URL Scanner
- Paste up to 50 URLs at once (textarea input)
- Upload a `.txt` or `.csv` file of URLs
- Results table with sortable columns (URL, status, confidence, timestamp)
- Export results to CSV or PDF batch report

### 5. Developer API
- Public edge function endpoint with API key authentication
- Rate-limited per key, with usage dashboard for developers
- JSON response: `{ url, label, confidence, score, explanation }`
- Simple documentation page with copy-to-clipboard code snippets (cURL, JS, Python)

---

### Technical Notes
- All database tables get proper GRANTs + RLS policies
- Existing global scan history can remain public; new user-scoped history gets a `user_id` column
- The extension gets a settings sync feature tied to the logged-in account
- Design follows existing cyber glassmorphism tokens

### Phased Rollout Suggestion
Phase 1: Auth + Personal Dashboard (foundation)
Phase 2: Public Threat Feed (community value)
Phase 3: Bulk Scanner + Developer API (power-user features)

Pick a phase or individual features to start with.