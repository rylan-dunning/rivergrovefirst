// Update your utils/cognitoConfig.js to use runtime config

import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Helper function to get config values
const getConfig = (key) => {
  if (typeof window !== 'undefined' && window.CONFIG) {
    return window.CONFIG[key];
  }
  
  // Fallback to environment variables for development
  switch (key) {
    case 'USER_POOL_ID':
      return process.env.NEXT_PUBLIC_USER_POOL_ID;
    case 'USER_POOL_CLIENT_ID':
      return process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
    default:
      return null;
  }
};

const poolData = {
  UserPoolId: getConfig('USER_POOL_ID') || '',
  ClientId: getConfig('USER_POOL_CLIENT_ID') || ''
};

export const userPool = typeof window !== 'undefined' 
  ? new CognitoUserPool(poolData) 
  : null;