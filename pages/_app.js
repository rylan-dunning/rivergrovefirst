// pages/_app.js - update your existing file
import React, { useEffect } from 'react';
import { Layout } from '../components';
import '@/styles/globals.css';
import '../styles/globals.scss';

function App({ Component, pageProps }) {


  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default App;