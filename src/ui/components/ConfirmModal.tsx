import { Modal } from './Modal'
import { Button } from './Button'
import { Box, Typography } from '@mui/material'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'error' | 'primary' | 'secondary'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor = 'error',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body1">{message}</Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmColor === 'error' ? 'danger' : confirmColor}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
