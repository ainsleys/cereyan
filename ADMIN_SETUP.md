# Admin Panel Setup

The admin panel allows authorized users to upload CSV files and deploy updates to the Cereyan website without technical knowledge.

## Access

Visit: **https://cereyan.xyz/admin**

## Setup Instructions

### 1. Environment Variables

Add these to your Vercel project:

#### `ADMIN_EMAILS`
Comma-separated list of authorized email addresses (no spaces after commas).

```
ADMIN_EMAILS=ainsley@example.com,colleague@example.com
```

#### `ADMIN_PASSWORD`
Shared password for all admin users.

```
ADMIN_PASSWORD=your-secure-password-here
```

**Important:** Use a strong password and share it securely with your team (e.g., via 1Password, LastPass, or in-person).

#### `GITHUB_TOKEN`
Personal Access Token with repo write access.

**Create token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "Cereyan Admin Panel"
4. Select scope: `repo` (Full control of private repositories)
5. Generate and copy the token

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

#### `ANTHROPIC_API_KEY`
Claude API key for AI assistance with CSV validation.

**Get key:**
1. Go to https://console.anthropic.com/
2. Create API key
3. Copy the key

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### 2. Add to Vercel

```bash
# Using Vercel CLI
vercel env add ADMIN_EMAILS
vercel env add ADMIN_PASSWORD
vercel env add GITHUB_TOKEN
vercel env add ANTHROPIC_API_KEY
```

Or add via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Make sure to enable "Sensitive" for ADMIN_PASSWORD and GITHUB_TOKEN

### 3. Redeploy

After adding environment variables, redeploy:

```bash
git push origin main
```

Or in Vercel Dashboard → Deployments → Redeploy

## Usage for Admins

### 1. Login
- Visit `/admin`
- Enter your authorized email
- Enter the shared admin password
- Click Login

### 2. Upload CSV
- Click "Choose File" and select your CSV
- Click "Preview Changes"

### 3. Review
The system will show:
- Date range
- Number of screenings
- Cereyan Selects count
- Any warnings (unknown venues, missing data)

**Claude will assist with:**
- Unknown venues → suggests similar names or asks for clarification
- Missing required data → requests additional information
- Format issues → explains what needs to be fixed

### 4. Deploy
- If everything looks good, click "Deploy to Production"
- The system will:
  1. Commit changes to GitHub
  2. Trigger automatic Vercel deployment
  3. Site updates in ~1 minute

## CSV Format

Use the template: `templates/weekly-screenings-template.csv`

### Required Columns
- `Tarih` - Date (DD.MM.YYYY)
- `Gösterim` - Film title (Turkish)
- `Saat` - Time (HH:MM or "Farklı Saatler")
- `Mekan` - Venue name

### Optional Columns
- `Gösterim (EN)` - English title
- `Yönetmen` - Director
- `Yıl` - Release year
- `Süre` - Runtime (minutes)
- `STAR` - Put "X" for Cereyan Selects
- `Etkinlik` - Event series name
- `Link` - Ticket/info URL

## Troubleshooting

### "Invalid email or password"
→ Check that:
- Your email is in the `ADMIN_EMAILS` list
- You're using the correct shared password
- Contact site admin if issues persist

### "Unknown venues" warning
Claude will help you:
- Match to existing venues
- Add new venues to the system
- Fix typos

### Deployment fails
1. Check that `GITHUB_TOKEN` is valid
2. Verify token has `repo` scope
3. Check Vercel logs for details

## Security

- Shared password protects access (not just email)
- Password verified on every API call
- GitHub token encrypted in Vercel
- Auth stored in session only (cleared on logout)
- All changes logged with commit history in GitHub
- Can roll back via GitHub if needed

**Note:** This uses a shared password (all admins use the same password). For higher security, consider implementing magic links or OAuth in the future.

## Support

Questions? Contact the site admin or check:
- GitHub: https://github.com/ainsleys/cereyan
- Scripts documentation: `/scripts/README.md`
