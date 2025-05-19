// utils/auth.js
import { 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { userPool } from './cognitoConfig';

// Check if user is authenticated
export const getCurrentUser = () => {
  if (!userPool) return null;
  return userPool.getCurrentUser();
};

// Get session details
export const getSession = async () => {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('No user found');
  }
  
  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session);
    });
  });
};

// Sign in user
export const signIn = (email, password) => {
  if (!userPool) throw new Error('User pool not available');
  
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password
  });
  
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool
  });
  
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

// Sign out user
export const signOut = () => {
  const user = getCurrentUser();
  if (user) {
    user.signOut();
  }
};