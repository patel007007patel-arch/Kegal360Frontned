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
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditVideoDialog = ({ open, setOpen, video, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'yoga',
    phase: 'all',
    isPremium: false,
    isActive: true,
    duration: ''
  })
  const [newVideoFile, setNewVideoFile] = useState(null)
  const [newThumbnailFile, setNewThumbnailFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        type: video.type || 'yoga',
        phase: video.phase || 'all',
        isPremium: video.isPremium || false,
        isActive: video.isActive !== undefined ? video.isActive : true,
        duration: video.duration ? String(video.duration) : ''
      })
      setNewVideoFile(null)
      setNewThumbnailFile(null)
    }
  }, [video])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'file' && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })
      if (newVideoFile && newVideoFile.size > 0) {
        formDataToSend.append('video', newVideoFile)
        if (formData.duration) {
          formDataToSend.append('duration', formData.duration)
        }
      }
      if (newThumbnailFile && newThumbnailFile.size > 0) {
        formDataToSend.append('thumbnail', newThumbnailFile)
      }

      await adminAPI.updateVideo(video._id, formDataToSend)
      toast.success('Video updated successfully')
      onSuccess()
      setOpen(false)
    } catch (error) {
      toast.error(error.message || 'Error updating video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{video ? 'Edit Video' : 'Add New Video'}</DialogTitle>
        <DialogContent sx={{ paddingTop: 2, overflow: 'visible' }} className='pbs-6'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='Title'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label='Type'
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value='yoga'>Yoga</MenuItem>
              <MenuItem value='meditation'>Meditation</MenuItem>
              <MenuItem value='breathwork'>Breathwork</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label='Phase'
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            >
              <MenuItem value='all'>All Phases</MenuItem>
              <MenuItem value='menstrual'>Menstrual</MenuItem>
              <MenuItem value='follicular'>Follicular</MenuItem>
              <MenuItem value='ovulation'>Ovulation</MenuItem>
              <MenuItem value='luteal'>Luteal</MenuItem>
            </TextField>
            <Box>
              <Typography variant='body2' className='mbe-2'>Replace Video (optional)</Typography>
              <Button variant='outlined' component='label' fullWidth size='small'>
                {newVideoFile ? newVideoFile.name : 'Choose new video file'}
                <input
                  type='file'
                  hidden
                  accept='video/*'
                  onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                />
              </Button>
              {newVideoFile && (
                <Typography variant='caption' color='text.secondary' className='mts-1 block'>
                  New file will replace the current video. Old file will be deleted.
                </Typography>
              )}
            </Box>
            {newVideoFile && (
              <TextField
                fullWidth
                type='number'
                label='Duration (seconds)'
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder={video?.duration ? `Current: ${video.duration}s` : ''}
                inputProps={{ min: 0 }}
              />
            )}
            <Box>
              <Typography variant='body2' className='mbe-2'>Replace Thumbnail (optional)</Typography>
              <Button variant='outlined' component='label' fullWidth size='small'>
                {newThumbnailFile ? newThumbnailFile.name : 'Choose new thumbnail'}
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={(e) => setNewThumbnailFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                />
              }
              label='Premium Content'
            />
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

export default EditVideoDialog
