# 🍦 Tasti Outbound Engine

**LinkedIn Outbound Sales Engine for Tasti Partnership & Affiliate Growth**

A white-label, AI-powered sales dashboard built for reaching fitness influencers, nutritionists, gym owners, and health brands to grow Tasti partnerships and affiliate opportunities.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- GitHub account (for code repo)
- Vercel account (for deployment)
- Google account (for Google Sheets)
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com/settings/keys))
- Hunter.io API key (from [hunter.io/api-key](https://hunter.io/api-key))

### Step 1: Google Sheets Setup

1. **Create Google Sheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "Tasti Leads"

2. **Add these column headers in Row 1:**
   ```
   id | first_name | last_name | full_name | title | company | company_url | 
   institution_type | state | email | linkedin_url | asset_size |
   status | linkedin_step | lead_score | export_status | notes | persona |
   created_at | updated_at
   ```

3. **Deploy Google Apps Script**
   - Click **Tools > Script editor**
   - Paste contents of `TASTI-GOOGLE-APPS-SCRIPT.js`
   - Click **Deploy > New Deployment**
   - Type: **Web app**
   - Execute as: **Your Account**
   - Who has access: **Anyone**
   - Copy the **Deployment URL** (you'll need this in Step 2)

### Step 2: GitHub Setup

1. **Create GitHub Repo**
   - Go to [github.com/new](https://github.com/new)
   - Name it `tasti-outbound-engine`
   - Clone it to your computer

2. **Add all files**
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/tasti-outbound-engine.git
   cd tasti-outbound-engine
   # Copy all files here
   git add .
   git commit -m "Initial Tasti outbound engine setup"
   git push origin main
   ```

### Step 3: Vercel Deployment

1. **Connect Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select Next.js framework

2. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add:
     - `ANTHROPIC_API_KEY` = `sk-ant-xxxxx` (from Anthropic console)
     - `HUNTER_API_KEY` = `xxxxxxxx` (from Hunter.io)

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your deployment URL (e.g., `https://tasti-outbound.vercel.app`)

### Step 4: Connect Google Sheet

1. **Open deployed app** at your Vercel URL
2. **Click Settings** (⚙️ icon, top right)
3. **Paste Google Apps Script URL** from Step 1
4. **Click "Connect & Sync"**
5. **Wait for leads to load** from your Google Sheet

---

## 📊 How It Works

### Pipeline Stages
- **Not Contacted** - Fresh leads from import
- **Request Sent** - Initial LinkedIn connection sent
- **Accepted / DM Sent** - Accepted connection, DM message sent
- **Following Up** - Follow-up message sent
- **Replied / Follow Up** - Lead replied, follow-up queued
- **Booked** - Call/demo scheduled
- **2nd Call** - Second meeting scheduled
- **Not Interested** - Lead declined
- **Closed** - Deal won or relationship closed

### Key Features

✅ **AI-Powered Messaging**
- Generate personalized LinkedIn connection notes
- Create DM openings & follow-ups
- Powered by Claude AI from Anthropic

✅ **Email Finder Integration**
- Find email addresses via Hunter.io
- Bulk email discovery
- Confidence scores

✅ **Lead Management**
- Drag-and-drop status pipeline
- Persona classification (Fitness Coach, Nutritionist, Gym Owner, etc.)
- Lead scoring & notes
- CSV export for campaign tools

✅ **Google Sheets Sync**
- Real-time data sync with Google Sheets
- Pagination for 11,000+ leads
- Bulk operations
- localStorage caching

✅ **Research Tools**
- Company insights
- Lead research integration
- Pre-call brief generation

---

## ⚙️ Customization

### Brand Colors
Edit `app/page.js`, find the color object:
```javascript
const C = {
  navy: "#0a1128",      // Dark background
  deep: "#0f1419",      // Card background
  card: "#1a2d42",      // Card foreground
  teal: "#ff6b35",      // Primary accent (Tasti orange)
  teal2: "#ff8c42",     // Secondary accent
  // ... more colors
};
```

### Company Info & Messaging
Edit `app/page.js`, find:
```javascript
const TASTI = "Tasti sells premium protein ice cream mixes...";
const PA = {
  "Fitness Coach": "...",
  "Nutritionist": "...",
  // ... customize per persona
};
```

### Personas
Edit `app/page.js`:
```javascript
const PERSONAS = [
  "Fitness Coach",
  "Nutritionist",
  "Gym Owner",
  "Health Brand",
  "Influencer",
  "Affiliate",
  "Other"
];
```

### AI Prompts
Edit `app/page.js`, find `emailPrompt()` and `liPrompt()` functions to customize messaging strategy.

---

## 🔑 API Keys

### Anthropic (Claude AI)
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click "Create API Key"
3. Name it "Tasti Outbound"
4. Copy and add to Vercel environment variables as `ANTHROPIC_API_KEY`

### Hunter.io
1. Go to [hunter.io](https://hunter.io) and sign up (free plan available)
2. Go to [hunter.io/api-key](https://hunter.io/api-key)
3. Copy your API key
4. Add to Vercel environment variables as `HUNTER_API_KEY`

---

## 📁 File Structure

```
tasti-outbound-engine/
├── app/
│   ├── layout.js              # Root layout, styles, fonts
│   ├── page.js                # Main dashboard component
│   └── api/
│       ├── generate/route.js  # Claude AI proxy
│       ├── hunter/route.js    # Email finder proxy
│       ├── sheets/route.js    # Google Sheets proxy
│       └── research/route.js  # Research/enrichment
├── package.json               # Dependencies
├── next.config.js             # Next.js configuration
├── TASTI-GOOGLE-APPS-SCRIPT.js # Paste into Google Apps Script
├── CUSTOMIZATION_GUIDE.md     # Detailed customization instructions
└── README.md                  # This file
```

---

## 🛠 Troubleshooting

### "Failed to load leads from Google Sheets"
- ✅ Check Google Apps Script URL is correct (paste from Step 1)
- ✅ Verify Google Apps Script is deployed as "Web app"
- ✅ Make sure deployment access is set to "Anyone"

### "AI generation failed"
- ✅ Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
- ✅ Check you have API credits at [console.anthropic.com](https://console.anthropic.com)
- ✅ Check API key is valid (starts with `sk-ant-`)

### "Email finder not working"
- ✅ Verify `HUNTER_API_KEY` is set in Vercel environment variables
- ✅ Check Hunter.io account has active API access
- ✅ Verify API key is correct

### "Leads not syncing to Google Sheet"
- ✅ Check Google Sheets URL matches in settings
- ✅ Verify column headers match exactly (case-sensitive)
- ✅ Check you have edit permissions on the Google Sheet

---

## 📈 Best Practices

### Cold Outreach Strategy
1. **Import leads** - Add 100-500 leads in Google Sheet
2. **Generate AI messages** - Use AI generation for personalization at scale
3. **Send via LinkedIn** - Copy messages to LinkedIn manually or use Instantly.ai
4. **Track responses** - Update status in dashboard
5. **Follow up** - Auto-generate follow-up messages as pipeline progresses

### Persona Optimization
- **Fitness Coaches** - Focus on protein, muscle recovery, product integration
- **Nutritionists** - Emphasize macros, clean ingredients, client benefits
- **Gym Owners** - Highlight wholesale pricing, member perks, bulk orders
- **Health Brands** - Target co-marketing, affiliate, white-label partnerships
- **Influencers** - Offer sponsorship, product seeding, commission structure

### Scaling Tips
- Use **CSV export** to sync leads into Instantly.ai or other tools
- **Segment by persona** for targeted messaging campaigns
- **A/B test** different connection notes for optimization
- **Track open rates** by status to refine follow-up timing
- **Batch operations** (update 50+ leads at once) for efficiency

---

## 🔄 Updating

To update to latest version:
```bash
git pull origin main
npm install
# Redeploy in Vercel (automatic on push)
```

---

## 📞 Support

For issues or questions:
1. Check **CUSTOMIZATION_GUIDE.md** for detailed customization
2. Verify all environment variables are set correctly
3. Check console.log errors in Vercel logs
4. Review API rate limits on Anthropic and Hunter.io

---

## 📄 License

This template is built for Tasti. Customization and reuse is encouraged for your own projects.

---

**Built with ❤️ using Next.js, React, and Claude AI**
