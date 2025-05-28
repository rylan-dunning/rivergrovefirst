// Create this file: utils/withAuth.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from './auth';

const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const user = getCurrentUser();
      if (!user) {
        router.push('/admin');
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;