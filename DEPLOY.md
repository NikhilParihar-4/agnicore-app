# AgniCore Technologies — Business App
## Deployment Guide (10 minutes)

---

## STEP 1 — Create Supabase account (free database + login)

1. Go to → https://supabase.com
2. Click "Start your project" → sign up (free)
3. Click "New project"
   - Name: agnicore-app
   - Password: choose a strong one (save it)
   - Region: Southeast Asia (Singapore) — closest to Bengaluru
4. Wait ~2 minutes for project to start

5. Go to → SQL Editor (left menu)
6. Copy ALL the contents of `supabase-schema.sql` and paste it, then click RUN
   ✅ This creates all your tables + sets contact@agnicoretechnologies.com as admin

7. Go to → Settings → API
   - Copy "Project URL" → this is your REACT_APP_SUPABASE_URL
   - Copy "anon public" key → this is your REACT_APP_SUPABASE_ANON_KEY

8. Go to → Authentication → Users → "Invite user"
   - Enter: contact@agnicoretechnologies.com
   - They'll send you an email to set your password

---

## STEP 2 — Deploy to Vercel (free hosting)

1. Go to → https://vercel.com → sign up with GitHub (free)
2. On GitHub (github.com), create a new repository called "agnicore-app"
3. Upload all these files to that repo (drag and drop the folder)

4. On Vercel:
   - Click "Add New Project"
   - Import your "agnicore-app" GitHub repo
   - Under "Environment Variables" add:
     ```
     REACT_APP_SUPABASE_URL = (paste your Project URL)
     REACT_APP_SUPABASE_ANON_KEY = (paste your anon key)
     ```
   - Click Deploy

5. ✅ Your app will be live at: https://agnicore-app.vercel.app

---

## STEP 3 — Custom domain (optional)

In Vercel → Settings → Domains → add: app.agnicoretechnologies.com

---

## STEP 4 — Add to your phone (PWA)

On Android:
- Open your app URL in Chrome
- Tap menu (3 dots) → "Add to Home screen"
- It works like a real app!

On iPhone:
- Open in Safari
- Tap Share → "Add to Home Screen"

---

## Login credentials

- Admin: contact@agnicoretechnologies.com (password set via invite email)
- To add employees: log in → Settings → Team members → Invite employee

---

## Need help?

Share the error message with Claude and say:
"Continue AgniCore app — I'm getting this error while deploying"
