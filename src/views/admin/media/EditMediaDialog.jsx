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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditMediaDialog = ({ open, handleClose, media, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    orientation: 'portrait',
    tags: [],
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [newMediaFile, setNewMediaFile] = useState(null)
  const [newThumbnailFile, setNewThumbnailFile] = useState(null)

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        description: media.description || '',
        duration: media.duration || 0,
        orientation: media.orientation || 'portrait',
        tags: media.tags || [],
        isActive: media.isActive !== undefined ? media.isActive : true
      })
      setNewMediaFile(null)
      setNewThumbnailFile(null)
    }
  }, [media])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const fd = new FormData()

      // Always send mediaType so backend routes uploads correctly (audio goes to /audio, video to /videos, etc.)
      fd.append('mediaType', String(media?.mediaType || 'video'))

      // Metadata
      fd.append('title', formData.title || '')
      fd.append('description', formData.description || '')
      fd.append('duration', String(parseInt(formData.duration) || 0))
      fd.append('orientation', formData.orientation || 'portrait')
      fd.append('isActive', formData.isActive ? 'true' : 'false')

      // Files (backend expects main file field name to be 'video' for all media types)
      if (newMediaFile) fd.append('video', newMediaFile)
      if (newThumbnailFile) fd.append('thumbnail', newThumbnailFile)

      console.log('\\n--- Frontend Log: Sending Media Data (EDIT) ---')
      console.log('newThumbnailFile object:', newThumbnailFile)
      console.log('newMediaFile object:', newMediaFile)
      for (let [key, value] of fd.entries()) {
        console.log(`FormData Entry - ${key}:`, value)
      }
      console.log('-----------------------------------------------\\n')

      await adminAPI.updateMedia(media._id, fd)
      toast.success('Media updated successfully')
      onRefresh()
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Error updating media')
    } finally {
      setLoading(false)
    }
  }

  const mediaType = (media?.mediaType || 'video').toLowerCase()
  const mainLabel =
    mediaType === 'audio' ? 'Replace Audio (optional)' :
      mediaType === 'video' ? 'Replace Video (optional)' :
        'Replace Media File (optional)'
  const mainAccept =
    mediaType === 'audio' ? 'audio/*' :
      mediaType === 'video' ? 'video/*' :
        'video/*,audio/*,image/*'

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Media</DialogTitle>
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
              <TextField
                fullWidth
                type='number'
                label='Duration (seconds)'
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='orientation-label'>Orientation</InputLabel>
                <Select
                  label='Orientation'
                  labelId='orientation-label'
                  value={formData.orientation}
                  onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                >
                  <MenuItem value='portrait'>Portrait</MenuItem>
                  <MenuItem value='landscape'>Landscape</MenuItem>
                  <MenuItem value='square'>Square</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant='body2' className='mbe-2'>
                  {mainLabel}
                </Typography>
                <Button
                  variant='outlined'
                  component='label'
                  fullWidth
                  size='small'
                  startIcon={<i className='ri-upload-2-line' />}
                >
                  {newMediaFile ? newMediaFile.name : 'Choose file'}
                  <input
                    type='file'
                    hidden
                    accept={mainAccept}
                    onChange={(e) => setNewMediaFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {newMediaFile && (
                  <Typography variant='caption' color='text.secondary' className='mts-1 block'>
                    New file will replace the current media file.
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant='body2' className='mbe-2'>
                  Replace Thumbnail (optional)
                </Typography>
                <Button
                  variant='outlined'
                  component='label'
                  fullWidth
                  size='small'
                  startIcon={<i className='ri-image-line' />}
                >
                  {newThumbnailFile ? newThumbnailFile.name : 'Choose thumbnail'}
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={(e) => setNewThumbnailFile(e.target.files?.[0] || null)}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
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

export default EditMediaDialog
