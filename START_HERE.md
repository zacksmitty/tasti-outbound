# 🚀 Tasti Outbound Engine - Quick Start (Give This to Your Friend)

Hi! You now have a **production-ready LinkedIn outbound sales engine** for Tasti partnerships. Here's everything you need to know:

## ⏱️ 1-Hour Setup

**Total time to go live: ~1 hour**
**Cost: $0/month + $0.03 per AI message**

## 📋 What You Have

A complete SaaS-grade outbound engine with:
- ✅ AI-powered LinkedIn message generation
- ✅ Partnership pipeline tracking (Not Contacted → Booked → 2nd Call → Closed)
- ✅ Email finder integration
- ✅ Google Sheets integration
- ✅ CSV export for campaigns
- ✅ Tasti vanilla cream brand theme

## 🎯 Quick Setup (Follow in Order)

### Step 1: Get Your API Keys (5 mins)

1. **Anthropic API Key** (for AI messages)
   - Go to: https://console.anthropic.com/settings/keys
   - Click "Create API Key"
   - Copy the key (starts with `sk-ant-`)
   - **SAVE THIS**

2. **Hunter.io API Key** (for email finder)
   - Go to: https://hunter.io/api-key
   - Copy your API key
   - **SAVE THIS**

### Step 2: Create Google Sheet (5 mins)

1. Go to: https://sheets.google.com
2. Create new spreadsheet
3. Name it: "Tasti Leads"
4. Add these headers in Row 1:
   ```
   id | first_name | last_name | full_name | title | company | company_url | 
   institution_type | state | email | linkedin_url | asset_size |
   status | linkedin_step | lead_score | export_status | notes | persona |
   created_at | updated_at
   ```
5. **SAVE THIS LINK**

### Step 3: Deploy Google Apps Script (5 mins)

1. In your Google Sheet, click **Tools > Script editor**
2. Delete all existing code
3. Open file: `TASTI-GOOGLE-APPS-SCRIPT.js` from your files
4. Copy entire contents
5. Paste into Google Apps Script editor
6. Click Save (Ctrl+S)
7. Click **Deploy > New Deployment**
   - Type: **Web app**
   - Execute as: **Your email**
   - Who has access: **Anyone**
8. Copy the deployment URL (format: `https://script.google.com/macros/s/xxxxx/exec`)
9. **SAVE THIS URL**

### Step 4: Set Up GitHub (10 mins)

1. Go to: https://github.com/signup (if you don't have an account)
2. Go to: https://github.com/new
3. Name: `tasti-outbound-engine`
4. Click "Create repository"
5. On your computer:
   ```bash
   git init
   git add .
   git commit -m "Initial Tasti outbound engine setup"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/tasti-outbound-engine.git
   git push -u origin main
   ```

### Step 5: Deploy to Vercel (10 mins)

1. Go to: https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your `tasti-outbound-engine` repo
5. **BEFORE DEPLOYING**, add environment variables:
   - `ANTHROPIC_API_KEY` = your key from Step 1
   - `HUNTER_API_KEY` = your key from Step 1
6. Click "Deploy"
7. Wait 2-3 minutes
8. Copy your Vercel URL (looks like: `https://tasti-outbound-xxxxx.vercel.app`)
9. **SAVE THIS URL**

### Step 6: Connect Everything (5 mins)

1. Open your Vercel URL from Step 5
2. Click Settings icon (⚙️) in top-right
3. Paste the Google Apps Script URL from Step 3
4. Click "Connect & Sync"
5. Wait for leads to load
6. **You should see "X leads loaded"**

## ✅ You're Live!

Your Tasti Outbound Engine is now running!

## 📖 Reading Materials

In your files folder:

- **INDEX.md** - Overview of all files
- **README.md** - Full feature documentation
- **GITHUB_SETUP.md** - Detailed GitHub/Vercel walkthrough
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist (1 hour)
- **CUSTOMIZATION_GUIDE.md** - How to customize colors, messaging, personas
- **TASTI_COLORS.md** - Brand color reference

## 🎨 Already Customized for You

✅ Tasti vanilla cream color scheme
✅ B2B partnership pipeline
✅ Partnership-focused AI prompts
✅ Persona system (Fitness Coach, Nutritionist, Gym Owner, Health Brand, Influencer, Affiliate)

## 🚀 Using Your Outbound Engine

1. **Import leads** into Google Sheet
2. **Click a lead** to view details
3. **Click "Generate LinkedIn Messages"** to create personalized outreach
4. **Copy the message** and paste into LinkedIn
5. **Update the lead status** as partnership progresses
6. **Export CSV** when ready for your campaign tool

## 🎯 How It Works

- **Not Contacted** → Initial outreach sent
- **Request Sent** → Connection request waiting
- **Accepted / DM Sent** → Connected, DM sent
- **Following Up** → Follow-up message sent
- **Replied / Follow Up** → They responded, follow-up queued
- **Booked** → Demo/call scheduled
- **2nd Call** → Second meeting scheduled
- **Closed** → Deal closed or relationship ended
- **Not Interested** → They declined

## 💡 Pro Tips

1. **Bulk import leads** via Google Sheet for faster setup
2. **Test with 10-20 leads** first before scaling
3. **Try different message variations** to find what works
4. **Track response rates** by status to optimize timing
5. **Export to CSV** when ready to send via LinkedIn automation

## 🆘 If Something Doesn't Work

**"Failed to load leads"**
- Check Google Apps Script URL is correct (paste in browser)
- Verify "Anyone" has access in Apps Script deployment

**"AI generation failed"**
- Check ANTHROPIC_API_KEY is set correctly in Vercel
- Verify you have API credits at console.anthropic.com

**"Email finder not working"**
- Check HUNTER_API_KEY is set correctly in Vercel
- Test with a common domain first (google.com)

**"Page is slow"**
- First page load takes 30-60 seconds (normal)
- Subsequent loads are much faster
- Check your internet connection

## 🎉 Next Steps

1. ✅ Complete the 6-step setup above
2. ✅ Import 50-100 Tasti partnership targets
3. ✅ Generate AI messages for first batch
4. ✅ Send via LinkedIn and track responses
5. ✅ Optimize based on what works best

## 💰 Costs

- **Vercel hosting**: Free (handles thousands of users)
- **Google Sheets**: Free
- **Anthropic API**: ~$0.03 per message (pay-as-you-go)
- **Hunter.io**: Free tier for email finding
- **Total**: $0-5/month depending on usage

## 📞 Questions?

See the documentation files in your folder:
- Setup questions → GITHUB_SETUP.md or DEPLOYMENT_CHECKLIST.md
- Feature questions → README.md
- Customization questions → CUSTOMIZATION_GUIDE.md
- Color/branding questions → TASTI_COLORS.md

---

**You're all set! Time to scale Tasti partnerships! 🍦**

---

*Built with Next.js, React, Claude AI, and Tasti's brand colors*
