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
import Autocomplete from '@mui/material/Autocomplete'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditStepDialog = ({ open, handleClose, step, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    media: '',
    audio: '',
    timer: 30,
    restTime: 0,
    order: 1,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [media, setMedia] = useState([])

  const videos = Array.isArray(media) ? media.filter(m => (m.mediaType || '').toLowerCase() === 'video') : []

  useEffect(() => {
    if (open) {
      setMediaLoading(true)
      adminAPI.getMedia()
        .then(res => {
          const list = res?.data?.media
          setMedia(Array.isArray(list) ? list : [])
        })
        .catch(() => setMedia([]))
        .finally(() => setMediaLoading(false))
    }
  }, [open])

  useEffect(() => {
    if (step) {
      setFormData({
        title: step.title || '',
        instructions: step.instructions || '',
        media: step.media?._id || step.media || '',
        audio: step.audio?._id || step.audio || '',
        timer: step.timer || 30,
        restTime: step.restTime || 0,
        order: step.order || 1,
        isActive: step.isActive !== undefined ? step.isActive : true
      })
    }
  }, [step])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await adminAPI.updateStep(step._id, formData)
      toast.success('Step updated successfully')
      onRefresh()
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Error updating step')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Step</DialogTitle>
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
                label='Instructions'
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                fullWidth
                options={videos}
                getOptionLabel={(option) => (option && option.title) || ''}
                value={videos.find(v => v._id === formData.media) || null}
                onChange={(_, newValue) => setFormData({ ...formData, media: newValue ? newValue._id : '' })}
                loading={mediaLoading}
                noOptionsText={mediaLoading ? 'Loading videos...' : 'No videos. Add videos in Media Library first.'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Media (Video)'
                    placeholder='Search or select video'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id='audio-label'>Audio (Optional)</InputLabel>
                <Select
                  label='Audio (Optional)'
                  labelId='audio-label'
                  value={formData.audio}
                  onChange={(e) => setFormData({ ...formData, audio: e.target.value })}
                >
                  <MenuItem value=''>None</MenuItem>
                  {media.filter(m => m.mediaType === 'audio').map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type='number'
                label='Timer (seconds)'
                value={formData.timer}
                onChange={(e) => setFormData({ ...formData, timer: parseInt(e.target.value) || 30 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type='number'
                label='Rest Time (seconds)'
                value={formData.restTime}
                onChange={(e) => setFormData({ ...formData, restTime: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type='number'
                label='Order'
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
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

export default EditStepDialog
