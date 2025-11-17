import { Box, Typography, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  isVisible: boolean
  onComplete: () => void
}

export function LoadingScreen({ isVisible, onComplete }: LoadingScreenProps) {
  const [showContent, setShowContent] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowContent(true)
      setFadeOut(false)
      // Simuler un chargement (minimum 1.5 secondes pour une belle animation)
      const timer = setTimeout(() => {
        setFadeOut(true)
        // Attendre la fin de l'animation de fade-out avant d'appeler onComplete
        setTimeout(() => {
          setShowContent(false)
          onComplete()
        }, 500) // Durée de l'animation de fade-out
      }, 1500) // Durée minimale du chargement

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!showContent) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/images/bg-city-builder.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.5s ease-out',
        opacity: fadeOut ? 0 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          animation: fadeOut ? 'fadeOut 0.5s ease-out' : 'fadeIn 0.3s ease-out',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <img
            src="/images/logo-city-builder.png"
            alt="CityBuilder Logo"
            style={{
              maxWidth: '400px',
              height: 'auto',
              maxHeight: '200px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
          />
        </Box>

        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
          }}
        />

        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.05em',
          }}
        >
          Chargement...
        </Typography>
      </Box>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-20px);
            }
          }
        `}
      </style>
    </Box>
  )
}
