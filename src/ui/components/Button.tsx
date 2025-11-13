import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const StyledButton = styled(MuiButton)<{ buttonVariant?: ButtonVariant }>(
  ({ theme, buttonVariant }) => ({
    borderRadius: theme.shape.borderRadius,
    fontWeight: 500,
    textTransform: 'none',
    boxShadow: theme.shadows[4],
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.shadows[8],
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
    ...(buttonVariant === 'primary' && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
    ...(buttonVariant === 'secondary' && {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.grey[300],
      },
    }),
    ...(buttonVariant === 'danger' && {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    }),
  })
)

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const muiSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'

  return (
    <StyledButton
      buttonVariant={variant}
      size={muiSize}
      {...props}
    >
      {children}
    </StyledButton>
  )
}
