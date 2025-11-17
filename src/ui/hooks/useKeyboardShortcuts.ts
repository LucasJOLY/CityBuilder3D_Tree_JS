import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onSave: () => void
  onAdmin: () => void
  onPause: () => void
  onSpeedChange: (speed: number) => void
  currentSpeed: number
  selectedBuilding: string | null
  onRotatePlacement?: () => void
}

export function useKeyboardShortcuts({
  onSave,
  onAdmin,
  onPause,
  onSpeedChange,
  currentSpeed,
  selectedBuilding,
  onRotatePlacement,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Touche 'a' ou 'A' pour ouvrir l'admin
      if (e.key === 'a' || e.key === 'A') {
        onAdmin()
      }

      // Touche 's' ou 'S' pour sauvegarder
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault() // Empêcher le comportement par défaut (sauvegarde de la page)
        onSave()
      }

      // Touche 'r' ou 'R' pour rotation (si un bâtiment est sélectionné)
      if ((e.key === 'r' || e.key === 'R') && selectedBuilding && onRotatePlacement) {
        onRotatePlacement()
      }

      // Touche Espace pour pause/play
      if (e.key === ' ') {
        e.preventDefault() // Empêcher le scroll de la page
        onPause()
      }

      // Changer la vitesse avec les touches 1, 2, 3, 4, 5 (numpad ou clavier principal)
      // Numpad : Numpad1, Numpad2, Numpad3, Numpad4, Numpad5
      // Clavier AZERTY : & (Shift+1), é (2), " (Shift+3), ' (4), ( (Shift+5)
      // Clavier QWERTY : 1, 2, 3, 4, 5
      if (
        e.key === 'Numpad1' ||
        e.key === 'Numpad2' ||
        e.key === 'Numpad3' ||
        e.key === 'Numpad4' ||
        e.key === 'Numpad5' ||
        e.key === '1' ||
        e.key === '2' ||
        e.key === '3' ||
        e.key === '4' ||
        e.key === '5' ||
        e.key === '&' ||
        e.key === 'é' ||
        e.key === '"' ||
        e.key === "'" ||
        e.key === '('
      ) {
        let newSpeed = currentSpeed
        if (e.key === 'Numpad1' || e.key === '1' || e.key === '&') {
          newSpeed = 1
        } else if (e.key === 'Numpad2' || e.key === '2' || e.key === 'é') {
          newSpeed = 2
        } else if (e.key === 'Numpad3' || e.key === '3' || e.key === '"') {
          newSpeed = 3
        } else if (e.key === 'Numpad4' || e.key === '4' || e.key === "'") {
          newSpeed = 4
        } else if (e.key === 'Numpad5' || e.key === '5' || e.key === '(') {
          newSpeed = 5
        }
        if (newSpeed !== currentSpeed && newSpeed >= 1 && newSpeed <= 5) {
          onSpeedChange(newSpeed)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onSave, onAdmin, onPause, onSpeedChange, currentSpeed, selectedBuilding, onRotatePlacement])
}
