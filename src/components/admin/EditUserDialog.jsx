'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditUserDialog = ({ open, setOpen, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    role: 'user',
    isActive: true,
    settings: {
      pushNotifications: true,
      darkTheme: false,
      emailUpdates: false
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        birthYear: user.birthYear || '',
        role: user.role || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
        settings: {
          pushNotifications: user.settings?.pushNotifications !== undefined ? user.settings.pushNotifications : true,
          darkTheme: user.settings?.darkTheme || false,
          emailUpdates: user.settings?.emailUpdates || false
        }
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await adminAPI.updateUser(user._id, formData)
      toast.success('User updated successfully')
      onSuccess()
      setOpen(false)
    } catch (error) {
      toast.error(error.message || 'Error updating user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ paddingTop: 2, overflow: 'visible' }} className='pbs-6'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='Name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label='Birth Year'
              type='number'
              value={formData.birthYear}
              onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) })}
            />
            <TextField
              fullWidth
              select
              label='Role'
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label='Active'
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='primary' disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditUserDialog
