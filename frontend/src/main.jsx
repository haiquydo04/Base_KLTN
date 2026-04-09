import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import App from './App';
import './index.css';

const AOSProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1100,
      once: false,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AOSProvider>
        <App />
      </AOSProvider>
    </HashRouter>
  </React.StrictMode>
);
