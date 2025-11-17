import { forwardRef } from 'react'
import { SnackbarContent } from '@mui/material'
import type { CustomContentProps } from 'notistack'

export const CustomSnackbar = forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => {
  const { message, variant } = props

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return '#10b981' // vert
      case 'error':
        return '#ef4444' // rouge
      case 'warning':
        return '#f6741b' // orange
      case 'info':
        return '#3b82f6' // bleu
      default:
        return '#6b7280' // gris par défaut
    }
  }

  return (
    <SnackbarContent
      ref={ref}
      role="alert"
      message={message}
      sx={{
        borderRadius: '1.5rem !important',
        backgroundColor: getVariantColor(),
        color: '#ffffff',
      }}
    />
  )
})

CustomSnackbar.displayName = 'CustomSnackbar'
