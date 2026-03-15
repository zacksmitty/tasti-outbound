# 🚀 Tasti Outbound Engine - Deployment Checklist

## Phase 1: Preparation (30 mins)

- [ ] Create GitHub account (if not already done)
- [ ] Create Vercel account (if not already done)
- [ ] Get Anthropic API Key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
- [ ] Get Hunter.io API Key from [hunter.io/api-key](https://hunter.io/api-key)
- [ ] Create Google Sheet for leads
- [ ] Have Google Sheet link ready

## Phase 2: Google Sheet Setup (15 mins)

- [ ] Open Google Sheet
- [ ] Create headers in Row 1:
  ```
  id | first_name | last_name | full_name | title | company | company_url |
  institution_type | state | email | linkedin_url | asset_size |
  status | linkedin_step | lead_score | export_status | notes | persona |
  created_at | updated_at
  ```
- [ ] Click **Tools > Script editor**
- [ ] Paste `TASTI-GOOGLE-APPS-SCRIPT.js` into script editor
- [ ] Save the script (Ctrl+S)
- [ ] Click **Deploy > New Deployment**
  - Type: **Web app**
  - Execute as: **Your email**
  - Who has access: **Anyone**
- [ ] Copy deployment URL (you'll need this!)
  - Format: `https://script.google.com/macros/s/xxxxx/exec`
- [ ] Test: Open URL in new tab, should show `{"error":"..."}`

## Phase 3: Code Repository (10 mins)

- [ ] Create new GitHub repo named `tasti-outbound-engine`
- [ ] Clone to computer: `git clone https://github.com/[YOUR-USERNAME]/tasti-outbound-engine.git`
- [ ] Copy all files from this folder into the repo directory
- [ ] Open terminal in repo directory
- [ ] Run commands:
  ```bash
  git add .
  git commit -m "Initial Tasti outbound engine setup"
  git push origin main
  ```
- [ ] Verify files appear on GitHub

## Phase 4: Vercel Deployment (10 mins)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Select "Import Git Repository"
- [ ] Search for `tasti-outbound-engine`
- [ ] Select it and click Import
- [ ] Wait for auto-detection (should show Next.js)
- [ ] Before deploying, add environment variables:
  - [ ] Click "Environment Variables"
  - [ ] Add `ANTHROPIC_API_KEY` = your key from Anthropic console
  - [ ] Add `HUNTER_API_KEY` = your key from Hunter.io
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes for deployment
- [ ] Copy your deployment URL (e.g., `https://tasti-outbound.vercel.app`)

## Phase 5: Final Connection (5 mins)

- [ ] Open your Vercel deployment URL
- [ ] Wait for page to load (might take 30 seconds first time)
- [ ] Scroll to top-right, click Settings icon (⚙️)
- [ ] Paste Google Apps Script URL from Phase 2
- [ ] Click "Connect & Sync"
- [ ] Wait for leads to load
- [ ] You should see "X leads loaded"

## Phase 6: Testing (5 mins)

- [ ] Click on "All Leads" in sidebar
- [ ] You should see your leads from Google Sheet
- [ ] Click on a lead to open details
- [ ] Test clicking "Generate LinkedIn Messages"
- [ ] Wait for AI response (should take 10-20 seconds)
- [ ] Verify message appears
- [ ] Test changing a lead's status
- [ ] Verify status updates in Google Sheet

## 🎉 You're Live!

Your Tasti Outbound Engine is ready to use!

### Next Steps:

1. **Import leads** - Add your Tasti partnership targets to Google Sheet
2. **Customize messaging** - Edit the AI prompts in `app/page.js` if needed
3. **Generate messages** - Use the dashboard to create personalized LinkedIn outreach
4. **Send & track** - Manually copy messages to LinkedIn and update status in dashboard
5. **Refine** - Test which personas and messages get best response rates

## 🆘 Troubleshooting

### "Failed to load leads"
- [ ] Check Google Apps Script URL is correct (paste it in browser - should show error)
- [ ] Verify "Anyone" has access to Google Apps Script
- [ ] Try clearing browser cache and refreshing

### "AI generation failed"
- [ ] Verify ANTHROPIC_API_KEY is set correctly in Vercel
- [ ] Check your Anthropic account has API credits
- [ ] Check your API key starts with `sk-ant-`

### "Email finder not working"
- [ ] Verify HUNTER_API_KEY is set in Vercel
- [ ] Check your Hunter.io account is active
- [ ] Try with a common domain first (e.g., google.com)

### Page is very slow
- [ ] First page load takes 30-60 seconds (normal for Next.js)
- [ ] Subsequent pages are much faster
- [ ] Can close browser console if showing errors

## 📞 Need Help?

- **Google Sheets issue?** → Check Google Apps Script error logs
- **Vercel issue?** → Check Vercel deployment logs
- **Code issue?** → Review files in repo for syntax errors
- **Feature request?** → Edit `app/page.js` to customize

## ✅ Success Indicators

You'll know it's working when:
- ✅ Leads load from Google Sheet into dashboard
- ✅ AI generates messages in 10-20 seconds
- ✅ Status changes sync to Google Sheet
- ✅ CSV export includes all leads
- ✅ Persona colors match Tasti brand

---

**Time to deployment: ~1 hour total**

**Cost: $0/month** (all free tiers)
- Vercel: Free tier handles 1000+ API calls/day
- Google Sheets: Free
- Anthropic: Pay-as-you-go (~$0.03 per message)
- Hunter.io: Free tier for email finding

---

**Happy outbounding! 🍦**
