# Tasti Outbound Engine - Setup & Customization Guide

## Overview
This is a white-label LinkedIn outbound sales engine customized for **Tasti** (high-protein ice cream mix partnerships & affiliates).

## What's Included

### Frontend Files (Next.js)
- `app/layout.js` - Root layout with Tasti branding
- `app/page.js` - Main dashboard (CUSTOMIZE THIS WITH YOUR COMPANY INFO)
- `app/api/generate/route.js` - Claude AI integration
- `app/api/hunter/route.js` - Hunter.io email finder
- `app/api/research/route.js` - Lead research
- `app/api/sheets/route.js` - Google Sheets proxy

### Backend Files
- `TASTI-GOOGLE-APPS-SCRIPT.js` - Paste into Google Apps Script
- `package.json` - Dependencies
- `next.config.js` - Next.js config

## Step-by-Step Setup

### 1. Get the Original Code
Get the complete page.js file from your friend (or I'll generate it below)

### 2. Google Apps Script Setup
1. Go to https://docs.google.com/spreadsheets/
2. Create or open your lead spreadsheet
3. Click **Tools > Script editor**
4. Clear the default code and paste the contents of `TASTI-GOOGLE-APPS-SCRIPT.js`
5. Click **Deploy > New Deployment**
6. Select Type: **Web app**
7. Execute as: Your account
8. Who has access: **Anyone**
9. Copy the deployment URL (looks like: `https://script.google.com/macros/s/AKfycbw.../exec`)

### 3. Set Google Sheet Columns
Your Google Sheet must have these columns (in any order):
```
id | first_name | last_name | full_name | title | company | company_url |
institution_type | state | email | linkedin_url | asset_size |
status | linkedin_step | lead_score | export_status | notes | persona |
created_at | updated_at
```

### 4. Vercel Deployment
1. Create a new GitHub repo in your friend's GitHub account
2. Push the files to GitHub
3. Go to https://vercel.com
4. Connect your GitHub repo
5. Add environment variables:
   - `ANTHROPIC_API_KEY` - From https://console.anthropic.com/settings/keys
   - `HUNTER_API_KEY` - From https://hunter.io/api-key
6. Deploy!

### 5. Environment Variables

Create a `.env.local` file (don't commit this to GitHub):
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
HUNTER_API_KEY=xxxxxxxx
```

Or set them in Vercel project settings > Environment Variables

### 6. Connect Your Google Sheet
1. Open the deployed app
2. Click "Settings" (⚙️)
3. Paste your Google Apps Script URL
4. Click "Connect & Sync"
5. Leads will start loading!

## Customization

### Colors (Edit `app/page.js`)
Find this section and change the colors:
```javascript
const C = {
  navy:"#0a1128",      // Dark background
  deep:"#0f1419",      // Card background
  card:"#1a2d42",      // Card color
  teal:"#ff6b35",      // Primary accent (Tasti orange)
  teal2:"#ff8c42",     // Secondary accent
  // ... more colors
};
```

### Company Name & Info (Edit `app/page.js`)
Find this section:
```javascript
const TASTI = "Tasti sells premium protein ice cream mixes for Ninja Creami machines...";
const PA = {
  CEO: "...",
  // Customize the value props per persona
};
```

### AI Prompts (Edit `app/page.js`)
Find `emailPrompt()` and `liPrompt()` functions and update the messaging strategy.

### Personas (Edit `app/page.js`)
Change from Finoveo's banking personas to Tasti's:
```javascript
const PERSONAS = ["Fitness Coach", "Nutritionist", "Gym Owner", "Health Brand", "Influencer", "Affiliate", "Other"];
```

## API Keys Your Friend Needs to Provide

1. **Anthropic API Key**
   - Go to https://console.anthropic.com/settings/keys
   - Create a new key
   - Give it a name like "Tasti Outbound"

2. **Hunter.io API Key**
   - Go to https://hunter.io/api-key
   - Copy your API key

3. **Google Apps Script URL**
   - From step "Google Apps Script Setup" above

## Features

✅ Lead pipeline management (Not Contacted → Closed)
✅ AI-powered email & LinkedIn message generation
✅ Hunter.io email finder integration
✅ Lead research tool
✅ Persona-based messaging
✅ Status tracking
✅ CSV export
✅ localStorage caching
✅ Bulk operations

## Troubleshooting

**"Failed to load leads"**
- Check Google Apps Script URL is correct
- Make sure Google Apps Script is deployed as "Web app"

**"AI generation failed"**
- Verify ANTHROPIC_API_KEY is set in Vercel environment variables
- Check you have API credits

**"Email finder not working"**
- Verify HUNTER_API_KEY is set
- Check Hunter.io account has API access

## Support Files

- `TASTI-GOOGLE-APPS-SCRIPT.js` - Copy-paste into Google Apps Script
- `package.json` - npm dependencies
- `next.config.js` - Next.js configuration
- `app/layout.js` - HTML head & global styles

## Next Steps

1. Customize `app/page.js` with Tasti-specific messaging
2. Get API keys from friend
3. Create GitHub repo
4. Deploy to Vercel
5. Connect Google Sheet
6. Start outbound!

Let me know if you need help customizing the prompts or colors!
