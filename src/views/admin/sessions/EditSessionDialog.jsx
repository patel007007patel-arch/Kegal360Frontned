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
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditSessionDialog = ({ open, handleClose, session, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    benefits: [],
    difficulty: 'beginner',
    equipment: 'Equipment-free',
    order: 1,
    isActive: true,
    isFree: true
  })
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState(null)

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        benefits: session.benefits || [],
        thumbnail: session.thumbnail || '',
        difficulty: session.difficulty || 'beginner',
        equipment: session.equipment || 'Equipment-free',
        order: session.order || 1,
        isActive: session.isActive !== undefined ? session.isActive : true,
        isFree: session.isFree !== undefined ? session.isFree : true
      })
    }
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      if (formData.description) formDataToSend.append('description', formData.description)
      if (Array.isArray(formData.benefits) && formData.benefits.length) {
        formDataToSend.append('benefits', JSON.stringify(formData.benefits))
      }
      formDataToSend.append('difficulty', formData.difficulty)
      if (formData.equipment) formDataToSend.append('equipment', formData.equipment)
      formDataToSend.append('order', String(formData.order || 1))
      formDataToSend.append('isActive', String(formData.isActive))
      formDataToSend.append('isFree', String(formData.isFree))
      // If user chose a new file, send it; otherwise keep existing thumbnail URL so backend doesn't clear it
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      } else if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }

      await adminAPI.updateSession(session._id, formDataToSend)
      toast.success('Session updated successfully')
      onRefresh()
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Error updating session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent sx={{ paddingTop: 2, overflow: 'visible' }} className='pbs-6'>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Title'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='difficulty-label'>Difficulty</InputLabel>
                <Select
                  label='Difficulty'
                  labelId='difficulty-label'
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <MenuItem value='beginner'>Beginner</MenuItem>
                  <MenuItem value='intermediate'>Intermediate</MenuItem>
                  <MenuItem value='advanced'>Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Equipment'
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
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
                    : (formData.thumbnail ? 'Leave empty to keep current thumbnail' : 'Upload a thumbnail image for this session')
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  />
                }
                label='Free'
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

export default EditSessionDialog
