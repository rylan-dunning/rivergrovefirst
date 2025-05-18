// pages/_app.js - update your existing file
import React, { useEffect } from 'react';
import { Layout } from '../components';
import '@/styles/globals.css';
import '../styles/globals.scss';
import { configureAmplify } from '../utils/amplifyConfig';

function App({ Component, pageProps }) {
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default App;