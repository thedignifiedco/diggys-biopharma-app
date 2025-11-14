# Biopharma Login Page Customization Guide

This guide explains how to configure Frontegg's hosted login page with biopharma-themed customizations.

## Overview

We've created a biopharma-themed customization for the hosted login page that includes:
- Professional medical blue color scheme (#0066cc)
- Molecular pattern background
- Clean, trustworthy medical aesthetic
- Biopharma-specific terminology and messaging
- Professional styling for inputs, buttons, and forms

## Architecture

### 1. Overrides Endpoint

The customization overrides are served from `/api/frontegg-login-overrides.ts`. This endpoint:
- Returns only `themeV2` and `localizations` objects (as required by Frontegg)
- Includes CORS headers to allow Frontegg to fetch the overrides
- Provides biopharma-themed styling and text

### 2. Configuration Script

The `scripts/configure-login-overrides.ts` script:
1. Gets a vendor token using your Frontegg credentials
2. Fetches the current metadata configuration from Frontegg
3. Updates the metadata with `metadataOverrides.url` pointing to your overrides endpoint

## Setup Instructions

### Step 1: Start Your Development Server

```bash
npm run dev
```

This will start your Next.js app on `http://localhost:3000` (or another port).

### Step 2: Configure Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_FRONTEGG_CLIENT_ID=your_client_id
NEXT_PUBLIC_FRONTEGG_API_KEY=your_api_key
FRONTEGG_OVERRIDES_URL=http://localhost:3000/api/frontegg-login-overrides
```

For production, set `FRONTEGG_OVERRIDES_URL` to your production URL:
```env
FRONTEGG_OVERRIDES_URL=https://your-domain.com/api/frontegg-login-overrides
```

### Step 3: Install TypeScript Node (if needed)

```bash
npm install --save-dev ts-node
```

### Step 4: Run the Configuration Script

```bash
npm run configure-login-overrides
```

Or manually:
```bash
npx ts-node scripts/configure-login-overrides.ts
```

This will:
- Authenticate with Frontegg API
- Fetch current login box metadata
- Update it with your overrides URL

### Step 5: Test the Customization

1. Navigate to your hosted login page
2. You should see the biopharma-themed customizations:
   - Medical blue color scheme
   - Molecular pattern background
   - Custom terminology ("Clinical Research Portal", "Professional Email", etc.)
   - Professional styling

## Customization Features

### Color Scheme
- **Primary Blue**: `#0066cc` - Trustworthy medical blue
- **Dark Blue**: `#004499` - Depth and professionalism  
- **Deep Blue**: `#003366` - Solid foundation
- **Error Red**: `#dc3545` - Clear error indication

### Typography
- Clean, readable sans-serif font stack
- Professional sizing (16px base)
- Appropriate line heights for readability

### Styling Elements

1. **Logo**: Customizable logo image (replace placeholder URL)
2. **Background**: Gradient with molecular pattern overlay
3. **Login Box**: Clean white card with subtle shadow
4. **Inputs**: Professional medical aesthetic with focus states
5. **Buttons**: Prominent medical blue with hover effects
6. **Links**: Consistent blue theme throughout

### Localization

All text is customized for biopharma context:
- "Clinical Research Portal" instead of generic messaging
- "Professional Email" instead of just "Email"
- "Request Access" instead of "Sign Up"
- Biopharma-specific terms and disclaimers

## Customization Options

### Update Logo

Edit `src/pages/api/frontegg-login-overrides.ts`:

```typescript
logo: {
  image: 'https://your-domain.com/logo.png', // Your logo URL
  alt: 'Your Company Logo',
  maxHeight: '60px'
}
```

### Change Colors

Update the color values in the `themeV2.loginBox` object:

```typescript
submitButtonTheme: {
  base: {
    backgroundColor: '#your-color', // Change this
    // ...
  }
}
```

### Modify Text

Edit the `localizations.en.loginBox` object to change any text:

```typescript
localizations: {
  en: {
    loginBox: {
      login: {
        title: 'Your Custom Title',
        subtitle: 'Your Custom Subtitle',
        // ...
      }
    }
  }
}
```

### Add More Styling

Refer to [Frontegg's styling documentation](https://developers.frontegg.com/ciam/guides/customizations/login-box/styling-examples) for more options.

## Testing

1. **Local Testing**: 
   - Run `npm run dev`
   - Make sure your overrides endpoint is accessible
   - Run the configuration script
   - Test the hosted login page

2. **Production Testing**:
   - Deploy your app
   - Update `FRONTEGG_OVERRIDES_URL` to production URL
   - Run the configuration script with production URL
   - Test the hosted login page

## Troubleshooting

### Overrides Not Showing

1. **Check CORS**: Make sure your overrides endpoint has CORS headers enabled
2. **Verify URL**: Ensure `FRONTEGG_OVERRIDES_URL` is correct and accessible
3. **Check Response**: Visit the overrides URL directly - should return valid JSON
4. **Re-run Script**: Run the configuration script again to update metadata

### Configuration Script Errors

1. **Missing Credentials**: Ensure `NEXT_PUBLIC_FRONTEGG_CLIENT_ID` and `NEXT_PUBLIC_FRONTEGG_API_KEY` are set
2. **Invalid Token**: Vendor token expires after 1 hour - re-run the script
3. **Network Issues**: Check your internet connection and Frontegg API status

### Styling Not Applied

1. **Clear Cache**: Clear browser cache and try again
2. **Check Metadata**: Verify metadata was updated correctly in Frontegg dashboard
3. **Validate JSON**: Ensure your overrides endpoint returns valid JSON structure

## Production Deployment

1. **Deploy Your App**: Deploy to Vercel, AWS, or your hosting platform
2. **Set Environment Variables**: Add production environment variables
3. **Update Overrides URL**: Set `FRONTEGG_OVERRIDES_URL` to production URL
4. **Run Configuration**: Execute the configuration script with production URL
5. **Test**: Verify the hosted login page shows customizations

## Additional Resources

- [Frontegg Customization Guide](https://developers.frontegg.com/ciam/sdks/customizations/configuration-old#customization-in-the-hosted-mode)
- [Styling Examples](https://developers.frontegg.com/ciam/guides/customizations/login-box/styling-examples)
- [Localization Examples](https://developers.frontegg.com/ciam/guides/customizations/login-box/localization-examples)

## Support

For issues or questions:
1. Check Frontegg documentation
2. Review the configuration script logs
3. Verify your overrides endpoint is accessible
4. Contact Frontegg support if needed





