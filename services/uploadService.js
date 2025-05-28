// Replace your uploadService.js with this version that auto-publishes:

const getConfig = (key) => {
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG[key];
  }
  
  // Fallback to environment variables for development
  switch (key) {
    case 'GRAPHCMS_ENDPOINT':
      return process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;
    case 'GRAPHCMS_TOKEN':
      return process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
    default:
      return null;
  }
};

export const uploadImage = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  console.log('Starting NEW asset system upload...');
  console.log('File:', { name: file.name, type: file.type, size: `${Math.round(file.size / 1024)} KB` });
  
  const contentEndpoint = getConfig('GRAPHCMS_ENDPOINT');
  const authToken = getConfig('GRAPHCMS_TOKEN');
  
  if (!contentEndpoint || !authToken) {
    throw new Error('Missing configuration - check config.js file');
  }
  
  // Convert CDN endpoint to regular API endpoint
  const apiEndpoint = contentEndpoint.replace('us-west-2.cdn.hygraph.com/content', 'api-us-west-2.hygraph.com/v2');
  
  console.log('API endpoint:', apiEndpoint);
  try {
    // Step 1: Create asset via GraphQL mutation to get upload URL
    console.log('Step 1: Creating asset entry...');
    
    const createAssetMutation = {
      query: `
        mutation CreateAsset($fileName: String) {
          createAsset(data: { fileName: $fileName }) {
            id
            url
            upload {
              status
              expiresAt
              error {
                code
                message
              }
              requestPostData {
                url
                date
                key
                signature
                algorithm
                policy
                credential
                securityToken
              }
            }
          }
        }
      `,
      variables: {
        fileName: file.name
      }
    };
    
    const createResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(createAssetMutation)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create asset: ${createResponse.status} ${errorText}`);
    }
    
    const createResult = await createResponse.json();
    console.log('Create asset result:', createResult);
    
    if (createResult.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(createResult.errors)}`);
    }
    
    const asset = createResult.data.createAsset;
    const uploadData = asset.upload;
    
    if (!uploadData || !uploadData.requestPostData) {
      throw new Error('No upload data received from Hygraph');
    }
    
    // Step 2: Upload file to S3 using the provided data
    console.log('Step 2: Uploading file to S3...');
    
    const postData = uploadData.requestPostData;
    const formData = new FormData();
    
    // Add all the required S3 fields in the correct order
    formData.append('X-Amz-Date', postData.date);
    formData.append('key', postData.key);
    formData.append('X-Amz-Signature', postData.signature);
    formData.append('X-Amz-Algorithm', postData.algorithm);
    formData.append('policy', postData.policy);
    formData.append('X-Amz-Credential', postData.credential);
    if (postData.securityToken) {
      formData.append('X-Amz-Security-Token', postData.securityToken);
    }
    // File must be last
    formData.append('file', file);
    
    const uploadResponse = await fetch(postData.url, {
      method: 'POST',
      body: formData
    });
    
    console.log('S3 upload response:', uploadResponse.status, uploadResponse.statusText);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${errorText}`);
    }
    
    // Step 3: Try to publish the asset immediately
    console.log('Step 3: Publishing asset...');
    
    const publishMutation = {
      query: `
        mutation PublishAsset($id: ID!) {
          publishAsset(where: { id: $id }, to: PUBLISHED) {
            id
            stage
          }
        }
      `,
      variables: {
        id: asset.id
      }
    };
    
    try {
      const publishResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(publishMutation)
      });
      
      if (publishResponse.ok) {
        const publishResult = await publishResponse.json();
        if (!publishResult.errors) {
          console.log('✅ Asset published successfully!');
        } else {
          console.warn('⚠️ Asset publish had errors:', publishResult.errors);
        }
      } else {
        console.warn('⚠️ Asset publish request failed:', publishResponse.status);
      }
    } catch (publishError) {
      console.warn('⚠️ Asset publishing failed, but upload succeeded:', publishError.message);
    }
    
    console.log('✅ Upload process complete!');
    
    // Return the asset info
    return {
      id: asset.id,
      url: asset.url
    };
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};