// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const AddVideoDrawer = props => {
  // Props
  const { open, handleClose, onRefresh } = props

  // States
  const [loading, setLoading] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: '',
      category: 'general',
      phase: 'all',
      duration: '',
      equipment: 'Equipment-free',
      isPremium: false,
      isActive: true
    }
  })

  const onSubmit = async data => {
    try {
      if (!videoFile) {
        toast.error('Please select a video file')
        return
      }
      if (!(videoFile instanceof File) || videoFile.size === 0) {
        toast.error('Please select a valid video file (file may be empty or invalid)')
        return
      }

      setLoading(true)
      const formData = new FormData()
      
      // Append video file with field name 'video' (required by backend)
      formData.append('video', videoFile)
      
      // Append thumbnail if provided (optional)
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
      }
      
      // Append all other fields
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('type', data.type)
      formData.append('category', data.category || 'general')
      formData.append('phase', data.phase || 'all')
      formData.append('duration', parseInt(data.duration) || 0)
      formData.append('equipment', data.equipment || 'Equipment-free')
      formData.append('isPremium', data.isPremium ? 'true' : 'false')
      formData.append('isActive', data.isActive ? 'true' : 'false')
      formData.append('benefits', JSON.stringify([]))
      formData.append('sequence', JSON.stringify(null))

      await adminAPI.createVideo(formData)
      toast.success('Video created successfully')
      handleClose()
      setVideoFile(null)
      setThumbnailFile(null)
      resetForm({ title: '', description: '', type: '', category: 'general', phase: 'all', duration: '', equipment: 'Equipment-free', isPremium: false, isActive: true })
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating video')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={handleReset}
      closeAfterTransition={false}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Add New Video
        <Typography component='span' className='flex flex-col text-center'>
          Add a new video to the system
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <DialogContent className='pbs-6 sm:pbe-6 sm:pli-16' sx={{ overflow: 'visible' }}>
          <IconButton onClick={handleReset} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
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
                    placeholder='Video Title'
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
                    placeholder='Video description'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant='body2' className='mbe-2'>
                  Video File (Required)
                </Typography>
                <Button
                  variant='outlined'
                  component='label'
                  fullWidth
                  startIcon={<i className='ri-upload-2-line' />}
                >
                  {videoFile ? videoFile.name : 'Choose Video File'}
                  <input
                    type='file'
                    hidden
                    accept='video/*'
                    onChange={e => setVideoFile(e.target.files[0])}
                  />
                </Button>
                {videoFile && (
                  <Typography variant='caption' color='text.secondary' className='mts-1'>
                    Selected: {videoFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant='body2' className='mbe-2'>
                  Thumbnail Image (Optional)
                </Typography>
                <Button
                  variant='outlined'
                  component='label'
                  fullWidth
                  startIcon={<i className='ri-image-line' />}
                >
                  {thumbnailFile ? thumbnailFile.name : 'Choose Thumbnail'}
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={e => setThumbnailFile(e.target.files[0])}
                  />
                </Button>
                {thumbnailFile && (
                  <Typography variant='caption' color='text.secondary' className='mts-1'>
                    Selected: {thumbnailFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='type-label' error={Boolean(errors.type)}>
                  Select Type
                </InputLabel>
                <Controller
                  name='type'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select label='Select Type' {...field} error={Boolean(errors.type)} labelId='type-label'>
                      <MenuItem value='yoga'>Yoga</MenuItem>
                      <MenuItem value='meditation'>Meditation</MenuItem>
                      <MenuItem value='breathwork'>Breathwork</MenuItem>
                    </Select>
                  )}
                />
                {errors.type && <FormHelperText error>This field is required.</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='category-label'>Select Category</InputLabel>
                <Controller
                  name='category'
                  control={control}
                  render={({ field }) => (
                    <Select label='Select Category' {...field} labelId='category-label'>
                      <MenuItem value='general'>General</MenuItem>
                      <MenuItem value='menstrual'>Menstrual</MenuItem>
                      <MenuItem value='follicular'>Follicular</MenuItem>
                      <MenuItem value='ovulation'>Ovulation</MenuItem>
                      <MenuItem value='luteal'>Luteal</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='phase-label'>Select Phase</InputLabel>
                <Controller
                  name='phase'
                  control={control}
                  render={({ field }) => (
                    <Select label='Select Phase' {...field} labelId='phase-label'>
                      <MenuItem value='all'>All Phases</MenuItem>
                      <MenuItem value='menstrual'>Menstrual</MenuItem>
                      <MenuItem value='follicular'>Follicular</MenuItem>
                      <MenuItem value='ovulation'>Ovulation</MenuItem>
                      <MenuItem value='luteal'>Luteal</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='duration'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Duration (seconds)'
                    placeholder='300'
                    {...(errors.duration && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='equipment'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Equipment'
                    placeholder='Equipment-free'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='isPremium'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label='Premium Video'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label='Active'
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
          <Button variant='outlined' color='secondary' type='reset' onClick={() => handleReset()} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddVideoDrawer

