import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Set the base URL for all axios requests
// This should match the API_URL in your api.js service (http://localhost:5000)
axios.defaults.baseURL = 'http://localhost:5000'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
