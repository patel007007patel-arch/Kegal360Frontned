'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const ConfirmationDialog = ({ open, setOpen, onConfirm, title, message, confirmText = 'Yes, Delete!', type = 'delete' }) => {
  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog fullWidth maxWidth='xs' open={open} onClose={handleCancel}>
      <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
        <Typography variant='h4' className='mbe-2'>
          {title || 'Are you sure?'}
        </Typography>
        {message && (
          <Typography color='text.primary'>
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
        <Button variant='contained' color={type === 'delete' ? 'error' : 'primary'} onClick={handleConfirm}>
          {confirmText}
        </Button>
        <Button variant='outlined' color='secondary' onClick={handleCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
