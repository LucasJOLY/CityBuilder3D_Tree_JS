import { Modal as MuiModal, Box, Typography, IconButton } from '@mui/material'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      disableEnforceFocus
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        className={className}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '42rem',
          width: '90vw',
          maxHeight: '90vh',
          outline: 'none',
        }}
      >
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <Typography variant="h2" component="h2">
              {title}
            </Typography>
            <IconButton
              onClick={onClose}
              aria-label="Fermer"
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        )}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            overscrollBehavior: 'contain',
          }}
        >
          <Box sx={{ p: 3 }}>{children}</Box>
        </Box>
      </Box>
    </MuiModal>
  )
}
