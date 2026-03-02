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
import Grid from '@mui/material/Grid'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditSequenceDialog = ({ open, handleClose, sequence, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    thumbnail: '',
    order: 1,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState(null)

  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name || '',
        displayName: sequence.displayName || '',
        description: sequence.description || '',
        thumbnail: sequence.thumbnail || '',
        order: sequence.order || 1,
        isActive: sequence.isActive !== undefined ? sequence.isActive : true
      })
    }
  }, [sequence])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('displayName', formData.displayName)
      if (formData.description) formDataToSend.append('description', formData.description)
      formDataToSend.append('order', String(formData.order || 1))
      formDataToSend.append('isActive', String(formData.isActive))

      // If user chose a new file, send it; otherwise keep existing thumbnail URL so backend doesn't clear it
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      } else if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }

      await adminAPI.updateSequence(sequence._id, formDataToSend)
      toast.success('Sequence updated successfully')
      onRefresh()
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Error updating sequence')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Sequence</DialogTitle>
        <DialogContent sx={{ paddingTop: 2, overflow: 'visible' }} className='pbs-6'>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Name (Internal)'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Display Name'
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Description'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='file'
                label='Thumbnail (Optional)'
                InputLabelProps={{ shrink: true }}
                onChange={e => {
                  const file = e.target.files?.[0] || null
                  setThumbnailFile(file)
                }}
                inputProps={{ accept: 'image/*' }}
                helperText={
                  thumbnailFile
                    ? thumbnailFile.name
                    : (formData.thumbnail ? 'Leave empty to keep current thumbnail' : 'Upload a thumbnail image for this sequence')
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Order'
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label='Active'
                className='mt-4'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
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

export default EditSequenceDialog
