import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import { markModelAsFailed } from '@/core/model-loader'

// Intercepter les erreurs de chargement de modèles .glb au niveau global
// AVANT qu'elles ne soient propagées
window.addEventListener('error', (event) => {
  const errorMessage = event.message || ''
  const errorFilename = event.filename || ''
  
  // Si l'erreur concerne un fichier .glb, marquer le modèle comme échoué
  if (
    (errorMessage.includes('.glb') || errorFilename.includes('.glb')) &&
    (errorMessage.includes('Unexpected token') || errorMessage.includes('Could not load'))
  ) {
    // Extraire le chemin du modèle depuis l'erreur
    const match = errorMessage.match(/\/models\/[^"'\s]+\.glb/) || errorFilename.match(/\/models\/[^"'\s]+\.glb/)
    if (match) {
      markModelAsFailed(match[0])
      event.preventDefault()
      event.stopPropagation()
      console.warn(`Modèle GLB non disponible, utilisation du fallback: ${match[0]}`)
      return false
    }
  }
}, true) // Utiliser capture phase pour intercepter avant propagation

// Intercepter aussi les promesses rejetées
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason?.toString() || ''
  
  if (
    (reason.includes('.glb') || reason.includes('/models/')) &&
    (reason.includes('Unexpected token') || reason.includes('Could not load'))
  ) {
    const match = reason.match(/\/models\/[^"'\s]+\.glb/)
    if (match) {
      markModelAsFailed(match[0])
      event.preventDefault()
      console.warn(`Modèle GLB non disponible, utilisation du fallback: ${match[0]}`)
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

