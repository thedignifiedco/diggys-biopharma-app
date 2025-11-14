/**
 * Script to configure Frontegg hosted login page with biopharma-themed customizations
 * 
 * This script:
 * 1. Gets a vendor token
 * 2. Fetches current metadata configuration
 * 3. Updates metadata with metadataOverrides pointing to our overrides endpoint
 * 
 * Usage:
 *   npm run configure-login-overrides
 * 
 * Or with ts-node:
 *   npx ts-node scripts/configure-login-overrides.ts
 * 
 * Make sure to set these environment variables:
 *   NEXT_PUBLIC_FRONTEGG_CLIENT_ID
 *   NEXT_PUBLIC_FRONTEGG_API_KEY
 *   FRONTEGG_OVERRIDES_URL (e.g., http://localhost:3000/api/frontegg-login-overrides)
 */

const FRONTEGG_API_URL = 'https://api.frontegg.com';
const ENTITY_NAME = 'loginBox'; // or 'adminBox' for admin portal

async function getVendorToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_FRONTEGG_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FRONTEGG_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error('Missing Frontegg credentials. Please set NEXT_PUBLIC_FRONTEGG_CLIENT_ID and NEXT_PUBLIC_FRONTEGG_API_KEY');
  }

  console.log('🔑 Fetching vendor token...');
  
  const response = await fetch(`${FRONTEGG_API_URL}/auth/vendor/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, secret: apiKey }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get vendor token: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Vendor token obtained');
  return data.token;
}

async function getCurrentMetadata(vendorToken: string): Promise<any> {
  console.log(`📥 Fetching current metadata for ${ENTITY_NAME}...`);
  
  const response = await fetch(`${FRONTEGG_API_URL}/metadata?entityName=${ENTITY_NAME}`, {
    headers: {
      'Authorization': `Bearer ${vendorToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Current metadata fetched');
  return data;
}

async function updateMetadata(vendorToken: string, currentMetadata: any, overridesUrl: string): Promise<void> {
  const overridesUrlEnv = process.env.FRONTEGG_OVERRIDES_URL || overridesUrl;
  
  if (!overridesUrlEnv) {
    throw new Error('Missing FRONTEGG_OVERRIDES_URL. Please set the URL where your overrides endpoint is hosted (e.g., http://localhost:3000/api/frontegg-login-overrides)');
  }

  console.log(`📤 Updating metadata with overrides URL: ${overridesUrlEnv}...`);

  // Merge current configuration with metadataOverrides
  const updatedConfiguration = {
    ...currentMetadata.configuration,
    metadataOverrides: {
      url: overridesUrlEnv
    }
  };

  const payload = {
    entityName: ENTITY_NAME,
    configuration: updatedConfiguration
  };

  const response = await fetch(`${FRONTEGG_API_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vendorToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update metadata: ${response.status} - ${errorText}`);
  }

  console.log('✅ Metadata updated successfully!');
  console.log(`\n🎨 Your hosted login page will now use customizations from: ${overridesUrlEnv}`);
  console.log('\n📝 Note: Make sure your overrides endpoint is accessible and returns the correct JSON structure.');
}

async function main() {
  try {
    const overridesUrl = process.env.FRONTEGG_OVERRIDES_URL || 'http://localhost:3000/api/frontegg-login-overrides';
    
    console.log('🚀 Starting Frontegg login page customization configuration...\n');
    console.log(`📍 Overrides URL: ${overridesUrl}\n`);

    // Step 1: Get vendor token
    const vendorToken = await getVendorToken();

    // Step 2: Get current metadata
    const currentMetadata = await getCurrentMetadata(vendorToken);

    // Step 3: Update metadata with overrides
    await updateMetadata(vendorToken, currentMetadata, overridesUrl);

    console.log('\n✨ Configuration complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure your app is running and the overrides endpoint is accessible');
    console.log('   2. Test the hosted login page to see your customizations');
    console.log('   3. Update the logo URL in the overrides endpoint if needed');
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { getVendorToken, getCurrentMetadata, updateMetadata };





