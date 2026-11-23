import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Sin StrictMode: el escáner QR (html5-qrcode) no tolera el doble montaje en dev.
createRoot(document.getElementById('root')).render(<App />)
