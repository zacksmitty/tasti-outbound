# 🚀 Tasti Outbound Engine - GitHub Setup for Your Friend

## Step 1: Download the Files

You have 2 options:

### Option A: Download ZIP (Easiest)
1. All files are in `/mnt/user-data/outputs/tasti-outbound-engine/`
2. Download the entire folder
3. Unzip on your computer

### Option B: Clone & Copy
```bash
# If you want to copy from your repo to theirs
git clone https://github.com/[YOUR-USERNAME]/tasti-outbound-engine.git
cd tasti-outbound-engine
```

## Step 2: Your Friend's GitHub Setup

1. **Create GitHub Account** (if needed): https://github.com/signup
2. **Create New Repository**:
   - Go to https://github.com/new
   - Name: `tasti-outbound-engine`
   - Description: "LinkedIn Outbound Sales Engine for Tasti B2B Partnerships"
   - Public or Private (up to them)
   - DO NOT initialize with README (we have one)
   - Click "Create repository"

3. **Add Files to Repository**:
```bash
# On their computer, in the repo folder:
git init
git add .
git commit -m "Initial Tasti outbound engine setup"
git branch -M main
git remote add origin https://github.com/[THEIR-USERNAME]/tasti-outbound-engine.git
git push -u origin main
```

## Step 3: Vercel Deployment

1. Go to https://vercel.com
2. Sign up / Login with GitHub
3. Click "New Project"
4. Select "Import Git Repository"
5. Find `tasti-outbound-engine` in their GitHub
6. Click "Import"
7. **Before deploying**, add Environment Variables:
   - Click "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = their key from console.anthropic.com
   - Add: `HUNTER_API_KEY` = their key from hunter.io/api-key
8. Click "Deploy"
9. Wait 2-3 minutes
10. Copy the Vercel URL (will look like `https://tasti-outbound-[random].vercel.app`)

## Step 4: Google Sheets Setup

1. Create Google Sheet with leads
2. **Add Column Headers** in Row 1:
```
id | first_name | last_name | full_name | title | company | company_url | 
institution_type | state | email | linkedin_url | asset_size |
status | linkedin_step | lead_score | export_status | notes | persona |
created_at | updated_at
```

3. **Deploy Google Apps Script**:
   - Click **Tools > Script editor**
   - Delete default code
   - Paste entire contents of `TASTI-GOOGLE-APPS-SCRIPT.js`
   - Click Save (Ctrl+S)
   - Click **Deploy > New Deployment**
     - Type: **Web app**
     - Execute as: **Their email**
     - Who has access: **Anyone**
   - Copy the deployment URL (looks like: `https://script.google.com/macros/s/AKfycbw.../exec`)
   - **SAVE THIS URL** - they need it next!

## Step 5: Connect Dashboard to Google Sheet

1. Open the Vercel deployment URL from Step 3
2. Scroll to top-right, click **Settings icon** (⚙️)
3. Paste the Google Apps Script URL from Step 4
4. Click "Connect & Sync"
5. Wait for leads to load
6. Should see "X leads loaded"

## ✅ Done!

Their Tasti Outbound Engine is now live and connected!

## 📁 File Structure They Have

```
tasti-outbound-engine/
├── README.md                      ← Full documentation
├── DEPLOYMENT_CHECKLIST.md        ← Step-by-step checklist
├── CUSTOMIZATION_GUIDE.md         ← How to customize
├── TASTI_COLORS.md                ← Brand colors reference
├── TASTI-GOOGLE-APPS-SCRIPT.js   ← Copy to Google Apps Script
├── package.json                   ← Dependencies
├── next.config.js                 ← Next.js config
└── app/
    ├── layout.js                  ← Root layout
    ├── page.js                    ← Main dashboard
    └── api/
        ├── generate/route.js      ← Claude AI
        ├── hunter/route.js        ← Email finder
        ├── sheets/route.js        ← Google Sheets
        └── research/route.js      ← Research tool
```

## 🎯 What They Can Do Now

✅ **Import leads** from Google Sheet
✅ **Generate personalized LinkedIn messages** with AI
✅ **Find email addresses** via Hunter.io
✅ **Track partnership pipeline** (Not Contacted → Closed)
✅ **Export CSV** for campaign tools
✅ **Manage multiple personas** (Fitness Coach, Nutritionist, Gym Owner, etc.)
✅ **Update lead status** in real-time

## 🎨 Brand Customization Already Done

- ✅ Vanilla cream color scheme applied
- ✅ Tasti brown & caramel accents
- ✅ B2B partnership pipeline (not B2C)
- ✅ Tasti-specific AI prompts
- ✅ Partnership-focused personas

## 🔧 If They Need to Customize

All customization is in `app/page.js`:
- **Line 7**: Change colors in `const C = {...}`
- **Line 12**: Change gradient
- **Line 47-48**: Change personas
- **Line 69**: Change company description
- **Line 70**: Change persona value props
- **Lines 72-79**: Change AI prompts

After any changes:
```bash
git add .
git commit -m "Updated [what changed]"
git push origin main
# Vercel auto-deploys on push!
```

## 📊 Estimated Costs

- **Vercel**: Free (handles their traffic)
- **Google Sheets**: Free
- **Anthropic API**: ~$0.03 per LinkedIn message (pay-as-you-go)
- **Hunter.io**: Free tier for email finding
- **Total**: ~$0/month + API usage

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to load leads" | Check Google Apps Script URL is correct |
| "AI generation failed" | Verify API key in Vercel environment variables |
| "Email finder not working" | Check Hunter.io API key is set |
| "Page is slow" | First load takes 30-60s (normal), then fast |

## 🎉 Success Indicators

Their setup works when:
- ✅ They can see leads from Google Sheet in dashboard
- ✅ AI generates messages in 10-20 seconds
- ✅ Status changes sync back to Google Sheet
- ✅ CSV export works

---

## 📞 Your Contact Info (Optional)

If they have questions, they can reach you at: [ADD YOUR EMAIL]

---

**Total setup time: ~1 hour**
**Live on the web immediately after deployment**
**Zero ongoing maintenance required**

Good luck with Tasti partnerships! 🍦
