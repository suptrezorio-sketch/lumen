import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './AdminApp'
import DirectorApp from './DirectorApp'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { SocketProvider } from './context/SocketContext'

import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

const isAdmin = window.location.pathname.startsWith('/admin');
const isDirector = window.location.pathname.startsWith('/director');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/director/*" element={
          <AppProvider>
            <SocketProvider>
              <DirectorApp />
            </SocketProvider>
          </AppProvider>
        } />
        <Route path="/*" element={
          <AppProvider>
            <SocketProvider>
              {isAdmin ? <AdminApp /> : <App />}
            </SocketProvider>
          </AppProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
