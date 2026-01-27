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
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        type: video.type || 'yoga',
        phase: video.phase || 'all',
        isPremium: video.isPremium || false,
        isActive: video.isActive !== undefined ? video.isActive : true
      })
    }
  }, [video])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'file') {
          formDataToSend.append(key, formData[key])
        }
      })

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
        <DialogContent>
          <div className='flex flex-col gap-4 mts-4'>
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
