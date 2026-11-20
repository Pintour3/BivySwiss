import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/yanone-kaffeesatz/400.css';
import '@fontsource/yanone-kaffeesatz/700.css';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/600.css';
import 'leaflet/dist/leaflet.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './App.jsx';
import { AuthProvider } from './features/Auth/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
