// services/uploadService.js - Improved version
export const uploadImage = async (file) => {
    if (!file) return null;
    
    // The correct Hygraph upload endpoint format
    const projectId = getProjectIdFromEndpoint(process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT);
    
    if (!projectId) {
      throw new Error('Could not determine project ID from the API endpoint');
    }
    
    // This is the correct format for the upload URL
    const uploadUrl = `https://api-us-west-2.hygraph.com/v2/${projectId}/upload`;
    
    const authToken = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
    
    if (!authToken) {
      throw new Error('Auth token not available. Please check your environment variables.');
    }
    
    console.log('Uploading image to:', uploadUrl);
    
    // Create FormData
    const formData = new FormData();
    formData.append('fileUpload', file);
    
    try {
      // Make the request
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Don't set Content-Type header when using FormData
        },
        body: formData,
      });
      
      // Log the full response for debugging
      console.log('Upload response status:', response.status);
      console.log('Upload response status text:', response.statusText);
      
      if (!response.ok) {
        let errorInfo;
        try {
          errorInfo = await response.text();
        } catch (e) {
          errorInfo = 'Could not parse error response';
        }
        
        console.error('Upload failed details:', errorInfo);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Return the URL and ID of the uploaded image
      return {
        url: data.url,
        id: data.id
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  // Helper function to extract project ID from the API endpoint
  function getProjectIdFromEndpoint(endpoint) {
    if (!endpoint) return null;
    
    // Try to extract the project ID from the endpoint URL
    // Example: https://api-us-west-2.hygraph.com/v2/clfg7gfds0001uh015zxg8jf9/master
    try {
      const matches = endpoint.match(/\/v2\/([^\/]+)/);
      if (matches && matches[1]) {
        return matches[1];
      }
    } catch (e) {
      console.error('Failed to extract project ID:', e);
    }
    
    return null;
  }