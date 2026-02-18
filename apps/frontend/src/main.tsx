import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/global.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { AlertProvider } from './context/AlertContext.tsx';
import { AlertContainer } from './components/alerts/AlertContainer.tsx';
import './lib/fontawesome';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <AlertContainer />
          <App />
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
