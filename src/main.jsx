// React safety checks during development
import { StrictMode } from 'react'

// React DOM renderer
import { createRoot } from 'react-dom/client'

// Global styles for the app
import './index.css'

// Main application component
import App from './App.jsx'


// ===== APP ENTRY POINT =====
// This mounts the React app into the <div id="root"></div> in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)