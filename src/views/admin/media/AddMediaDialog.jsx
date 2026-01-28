'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const AddMediaDialog = ({ open, handleClose, onRefresh }) => {
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      mediaType: 'video',
      duration: 0,
      orientation: 'portrait',
      tags: [],
      isActive: true
    }
  })

  const onSubmit = async (data) => {
    try {
      if (!mediaFile && data.mediaType !== 'image') {
        toast.error('Please select a media file')
        return
      }

      setLoading(true)
      const formData = new FormData()
      
      // Backend uploadVideoAndThumbnail middleware expects 'video' field
      // For now, we'll use 'video' field for all media types (backend can be updated later)
      if (mediaFile) {
        formData.append('video', mediaFile)
      }
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
      }
      
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('mediaType', data.mediaType)
      formData.append('duration', data.duration || 0)
      formData.append('orientation', data.orientation)
      formData.append('isActive', data.isActive ? 'true' : 'false')
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags))
      }

      await adminAPI.createMedia(formData)
      toast.success('Media created successfully')
      handleClose()
      setMediaFile(null)
      setThumbnailFile(null)
      resetForm()
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating media')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={handleClose}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Add New Media
        <Typography component='span' className='flex flex-col text-center'>
          Add a new media file to the library
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-6 sm:pbe-6 sm:pli-16' sx={{ overflow: 'visible' }}>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='mediaType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='media-type-label'>Media Type</InputLabel>
                    <Select {...field} label='Media Type' labelId='media-type-label'>
                      <MenuItem value='video'>Video</MenuItem>
                      <MenuItem value='audio'>Audio</MenuItem>
                      <MenuItem value='image'>Image</MenuItem>
                      <MenuItem value='animation'>Animation</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='orientation'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='orientation-label'>Orientation</InputLabel>
                    <Select {...field} label='Orientation' labelId='orientation-label'>
                      <MenuItem value='portrait'>Portrait</MenuItem>
                      <MenuItem value='landscape'>Landscape</MenuItem>
                      <MenuItem value='square'>Square</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Title'
                    placeholder='Pyramid Pose Video'
                    {...(errors.title && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Description'
                    placeholder='Description of the media'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='file'
                label='Media File'
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setMediaFile(e.target.files[0])}
                inputProps={{ accept: 'video/*,audio/*,image/*' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type='file'
                label='Thumbnail (Optional)'
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                inputProps={{ accept: 'image/*' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='tags'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Tags (comma-separated)'
                    placeholder='yoga, kegel, breathing'
                    helperText='Enter tags separated by commas'
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      field.onChange(tags)
                    }}
                    value={field.value?.join(', ') || ''}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='duration'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Duration (seconds)'
                    placeholder='60'
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label='Active'
                    className='mt-4'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Creating...' : 'Submit'}
          </Button>
          <Button variant='outlined' color='secondary' type='reset' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddMediaDialog
