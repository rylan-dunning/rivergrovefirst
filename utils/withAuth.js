// utils/withAuth.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';

const withAuth = (WrappedComponent) => {
  const WithAuth = (props) => {
    const Router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          await Auth.currentAuthenticatedUser();
          setVerified(true);
        } catch (err) {
          Router.replace('/login');
        }
      };
      
      checkAuth();
    }, [Router]);

    if (verified) {
      return <WrappedComponent {...props} />;
    } else {
      return null; // or a loading state
    }
  };

  return WithAuth;
};

export default withAuth;