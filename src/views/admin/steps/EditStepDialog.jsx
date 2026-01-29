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
import Typography from '@mui/material/Typography'
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

const loadMedia = async () => {
  try {
    const res = await adminAPI.getMedia()
    const list = res?.data?.media
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

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
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [media, setMedia] = useState([])

  const videos = Array.isArray(media) ? media.filter(m => (m.mediaType || '').toLowerCase() === 'video') : []

  useEffect(() => {
    if (open) {
      setMediaLoading(true)
      loadMedia()
        .then(setMedia)
        .finally(() => setMediaLoading(false))
      setShowUpload(false)
      setVideoFile(null)
      setVideoTitle('')
    }
  }, [open])

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }
    try {
      setUploadingVideo(true)
      const fd = new FormData()
      fd.append('video', videoFile)
      fd.append('title', videoTitle || formData.title || 'New Video')
      fd.append('mediaType', 'video')
      fd.append('orientation', 'portrait')
      fd.append('isActive', 'true')
      const response = await adminAPI.createMedia(fd)
      const newVideo = response.data?.media
      if (newVideo) {
        const list = await loadMedia()
        setMedia(list)
        setFormData(prev => ({ ...prev, media: newVideo._id }))
        toast.success('Video uploaded and selected successfully')
        setShowUpload(false)
        setVideoFile(null)
        setVideoTitle('')
      }
    } catch (error) {
      toast.error(error.message || 'Error uploading video')
    } finally {
      setUploadingVideo(false)
    }
  }

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
                noOptionsText={mediaLoading ? 'Loading videos...' : 'No videos. Add videos in Media Library or upload below.'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Media (Video)'
                    placeholder='Search or select video'
                  />
                )}
              />
              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='ri-upload-line' />}
                onClick={() => setShowUpload(!showUpload)}
                sx={{ mt: 2 }}
              >
                {showUpload ? 'Cancel Upload' : 'Upload New Video'}
              </Button>
              {showUpload && (
                <Grid container spacing={2} sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='subtitle2' gutterBottom>
                      Upload New Video
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label='Video Title'
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder={formData.title || 'Enter video title'}
                      helperText='Leave empty to use step title'
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      type='file'
                      label='Video File'
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      inputProps={{ accept: 'video/*' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant='contained'
                      onClick={handleVideoUpload}
                      disabled={!videoFile || uploadingVideo}
                      startIcon={uploadingVideo ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-upload-line' />}
                    >
                      {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                    </Button>
                  </Grid>
                </Grid>
              )}
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
