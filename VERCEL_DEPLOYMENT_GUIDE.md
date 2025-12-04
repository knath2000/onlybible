# Vercel Deployment Guide for Bible App

This guide provides detailed instructions for deploying your Bible reading app to Vercel and configuring it to work with the Biblia.com API.

## Prerequisites

- Vercel account
- Biblia.com API key (already obtained)
- This Next.js project

## Step 1: Environment Variables Setup

### In Vercel Dashboard

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:

| Key | Value | Type |
|-----|-------|------|
| `BIBLIA_API_KEY` | `23a0d5fbb123f4ef5d844378e7b4ef5d` | Production |
| `BIBLIA_API_KEY` | `23a0d5fbb123f4ef5d844378e7b4ef5d` | Preview |
| `BIBLIA_API_KEY` | `23a0d5fbb123f4ef5d844378e7b4ef5d` | Development |

**Important**: The API key you're using is domain-restricted. Make sure to register your Vercel domain with Biblia.com.

### In Biblia.com Dashboard

1. Go to https://api.biblia.com/v1/Users/SignIn
2. Sign in with your credentials
3. Navigate to **API Keys** section
4. Find your API key and click **Edit** or **Manage**
5. Add your Vercel domains to the allowed domains list:
   - `your-project-name.vercel.app` (Production)
   - `your-project-name-git-branch.vercel.app` (Preview)
   - `localhost` (Development)

## Step 2: Project Configuration

### Next.js Configuration

The project is already configured with:
- App Router (Next.js 16)
- TypeScript
- Tailwind CSS
- Environment variable access in API routes

### API Route Configuration

The API route at `app/api/bible/route.ts` is configured to:
- Accept Bible ID, passage, and format parameters
- Make requests to Biblia.com API
- Return HTML content for better formatting
- Include comprehensive error logging
- Set appropriate cache headers

**Example API calls:**
```
GET /api/bible?bible=RVR60&passage=Juan+3:16&format=html
GET /api/bible?bible=RVR60&passage=Juan+3:16&format=text
```

## Step 3: Deployment

### Option A: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Vercel dashboard, click **Add New Project**
3. Import your repository
4. Configure build settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click **Deploy**

### Option B: Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel login` and follow authentication steps
3. Navigate to your project directory
4. Run `vercel` and follow the prompts
5. Run `vercel --prod` to deploy to production

## Step 4: Testing the Deployment

### Test API Endpoint

After deployment, test the API endpoint directly:

```
https://your-project-name.vercel.app/api/bible?bible=RVR60&passage=Juan+3:16&format=html
```

Expected response: HTML content with John 3:16 in Spanish (Reina-Valera 1960)

### Test Application

Visit your deployed application:
```
https://your-project-name.vercel.app
```

### Debug Information

The application includes a **"Probar Conexión"** (Test Connection) button that:
- Makes a test API call to Biblia.com
- Displays detailed response information
- Shows any error messages with debugging details

## Step 5: Troubleshooting

### Common Issues

#### 1. 401 Unauthorized Error
**Cause**: API key not recognized or domain not authorized
**Solution**: 
- Verify API key in Vercel environment variables
- Check domain registration in Biblia.com dashboard
- Ensure correct domain format (include `https://`)

#### 2. 403 Forbidden Error
**Cause**: Domain restriction blocking the request
**Solution**:
- Add your Vercel domain to Biblia.com allowed domains
- Wait a few minutes for changes to propagate
- Test with different domains (production vs preview)

#### 3. 404 Not Found Error
**Cause**: Invalid Bible ID or passage format
**Solution**:
- Verify Bible ID is `RVR60` for Reina-Valera 1960
- Ensure passage format uses `+` for spaces: `Juan+3:16`
- Check Biblia.com documentation for valid parameters

#### 4. 500 Internal Server Error
**Cause**: Server-side issues or network problems
**Solution**:
- Check Vercel logs for detailed error messages
- Verify network connectivity
- Contact Biblia.com support if issue persists

### Debug Logs

Check Vercel logs for detailed information:
1. Go to Vercel dashboard
2. Select your project
3. Click on **Logs** or **Functions**
4. Look for API route logs with request/response details

### Local Testing

Test locally before deploying:
```bash
npm run dev
```

Visit `http://localhost:3000` and use the test features.

## Step 6: Performance Optimization

### Caching Strategy

The API route includes caching headers:
- Cache-Control: `public, max-age=3600` (1 hour)
- This reduces API calls and improves performance

### Monitoring

Set up monitoring in Vercel:
1. Go to **Analytics** in your project
2. Monitor API response times
3. Track error rates
4. Set up alerts for failures

## API Documentation

### Supported Parameters

| Parameter | Required | Values | Example |
|-----------|----------|--------|---------|
| `bible` | Yes | `RVR60` | `RVR60` |
| `passage` | Yes | Bible reference | `Juan+3:16` |
| `format` | No | `html`, `text` | `html` |

### Response Formats

#### HTML Format
Returns formatted HTML with verse text, suitable for direct display.

#### Text Format
Returns plain text with JSON wrapper containing:
- `reference`: Full verse reference
- `text`: Verse text
- `translation`: Bible version
- `verse`, `chapter`, `book`: Individual components

### Error Responses

Error responses include detailed information:
- `error`: Error message
- `details`: Additional error details
- `bibleId`: Requested Bible version
- `passage`: Requested passage
- `status`: HTTP status code

## Security Notes

⚠️ **Important**: The API key used in this project (`23a0d5fbb123f4ef5d844378e7b4ef5d`) has been exposed in the code. For production use:

1. **Regenerate your API key** in the Biblia.com dashboard
2. **Update environment variables** in Vercel with the new key
3. **Remove the old key** from Biblia.com dashboard
4. **Never commit API keys** to version control

## Support

If you encounter issues:

1. Check the **Debug Information** section in the deployed app
2. Review **Vercel logs** for detailed error messages
3. Verify **Biblia.com API status** and documentation
4. Contact Biblia.com support for API-specific issues

---

**Last Updated**: December 4, 2025  
**Next.js Version**: 16.0.7  
**Bible Version**: Reina-Valera 1960 (RVR60)