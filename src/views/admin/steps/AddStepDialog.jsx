'use client'

// React Imports
import { useState, useEffect } from 'react'

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
import Autocomplete from '@mui/material/Autocomplete'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const defaultStepFormValues = {
  session: '',
  title: '',
  instructions: '',
  media: '',
  audio: '',
  timer: 30,
  restTime: 0,
  order: 1,
  isActive: true
}

const AddStepDialog = ({ open, handleClose, onRefresh, initialSessionId = null }) => {
  const [loading, setLoading] = useState(false)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [isOrderManuallyEdited, setIsOrderManuallyEdited] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showAudioUpload, setShowAudioUpload] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [audioTitle, setAudioTitle] = useState('')
  const [sessions, setSessions] = useState([])
  const [media, setMedia] = useState([])

  const videos = Array.isArray(media) ? media.filter(m => (m.mediaType || '').toLowerCase() === 'video') : []
  const audios = Array.isArray(media) ? media.filter(m => (m.mediaType || '').toLowerCase() === 'audio') : []

  useEffect(() => {
    if (open) {
      Promise.all([
        adminAPI.getSessions().then(res => res?.data?.sessions || []).catch(() => []),
        loadMedia()
      ]).then(([sessionsData]) => {
        setSessions(sessionsData)
      })
      setShowUpload(false)
      setShowAudioUpload(false)
      setVideoFile(null)
      setAudioFile(null)
      setVideoTitle('')
      setAudioTitle('')
      setIsOrderManuallyEdited(false)
    }
  }, [open])

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    try {
      setUploadingVideo(true)
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('title', videoTitle || stepTitle || 'New Video')
      formData.append('mediaType', 'video')
      formData.append('orientation', 'portrait')
      formData.append('isActive', 'true')

      const response = await adminAPI.createMedia(formData)
      const newVideo = response.data?.media

      if (newVideo) {
        await loadMedia()
        setValue('media', newVideo._id)
        if (newVideo.duration != null) setValue('timer', Number(newVideo.duration) || 30)
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

  const {
    control,
    reset: resetForm,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: defaultStepFormValues
  })

  const stepTitle = watch('title')
  const selectedSessionId = watch('session')
  const [mediaType, setMediaType] = useState('video')

  useEffect(() => {
    if (open) {
      resetForm({ ...defaultStepFormValues, session: initialSessionId || '' })
      setIsOrderManuallyEdited(false)
    }
  }, [open, initialSessionId])

  // Auto-set next order (max existing + 1) for selected session, unless user edited it manually.
  useEffect(() => {
    if (!open || !selectedSessionId) return
    if (isOrderManuallyEdited) return

    adminAPI
      .getSteps({ sessionId: selectedSessionId })
      .then((res) => {
        const steps = res?.data?.steps
        const list = Array.isArray(steps) ? steps : []
        const maxOrder = list.reduce((max, s) => Math.max(max, Number(s?.order) || 0), 0)
        const nextOrder = Math.max(1, maxOrder + 1)
        setValue('order', nextOrder, { shouldDirty: false, shouldTouch: false, shouldValidate: false })
      })
      .catch(() => {
        // Keep existing order if fetch fails
      })
  }, [open, selectedSessionId, isOrderManuallyEdited, setValue])

  // Load media when dialog opens or after upload
  const loadMedia = async () => {
    setMediaLoading(true)
    try {
      const res = await adminAPI.getMedia()
      const list = res?.data?.media
      setMedia(Array.isArray(list) ? list : [])
    } catch {
      setMedia([])
    } finally {
      setMediaLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const payload = { ...data }

      // Backend requires `media` (ObjectId). For "Audio" mode, we store the selected audio Media id into `media`.
      if (mediaType === 'audio') {
        if (!payload.audio) {
          toast.error('Please select an audio media item')
          setLoading(false)
          return
        }
        payload.media = payload.audio
        delete payload.audio
      } else {
        // Video mode: audio is optional; avoid sending empty string (causes ObjectId cast errors on some schemas)
        if (!payload.media) {
          toast.error('Please select a video media item')
          setLoading(false)
          return
        }
        if (!payload.audio) delete payload.audio
      }

      await adminAPI.createStep(payload)
      toast.success('Step created successfully')
      handleClose()
      resetForm(defaultStepFormValues)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating step')
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
        Add New Step
        <Typography component='span' className='flex flex-col text-center'>
          Add a new step/pose to a session
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-6 sm:pbe-6 sm:pli-16' sx={{ overflow: 'visible' }}>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='session'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='session-label'>Session</InputLabel>
                    <Select {...field} label='Session' labelId='session-label' error={Boolean(errors.session)}>
                      {sessions.map((session) => (
                        <MenuItem key={session._id} value={session._id}>
                          {session.title}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.session && <Typography variant='caption' color='error'>This field is required.</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id='media-type-label'>Media Type</InputLabel>
                <Select
                  labelId='media-type-label'
                  label='Media Type'
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                >
                  <MenuItem value='video'>Video</MenuItem>
                  <MenuItem value='audio'>Audio</MenuItem>
                </Select>
              </FormControl>
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
                    placeholder='Pyramid Pose'
                    {...(errors.title && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='instructions'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Instructions'
                    placeholder='Instructions for this step'
                  />
                )}
              />
            </Grid>
            {mediaType === 'video' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='media'
                  control={control}
                  rules={{ required: mediaType === 'video' }}
                  render={({ field }) => (
                    <>
                      <Autocomplete
                        fullWidth
                        options={videos}
                        getOptionLabel={(option) => (option && option.title) || ''}
                        value={videos.find(v => v._id === field.value) || null}
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue._id : '')
                          if (newValue?.duration != null) setValue('timer', Number(newValue.duration) || 30)
                        }}
                        loading={mediaLoading}
                        noOptionsText={mediaLoading ? 'Loading videos...' : 'No videos. Add videos in Media Library first.'}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Media (Video)'
                            placeholder='Search or select video'
                            error={Boolean(errors.media)}
                            helperText={errors.media ? 'This field is required.' : undefined}
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
                              placeholder={stepTitle || 'Enter video title'}
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
                    </>
                  )}
                />
              </Grid>
            )}
            {mediaType === 'audio' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='audio'
                  control={control}
                  rules={{ required: mediaType === 'audio' }}
                  render={({ field }) => (
                    <>
                      <Autocomplete
                        fullWidth
                        options={audios}
                        getOptionLabel={(option) => (option && option.title) || ''}
                        value={audios.find(a => a._id === field.value) || null}
                        onChange={(_, newValue) => {
                          field.onChange(newValue ? newValue._id : '')
                        }}
                        loading={mediaLoading}
                        noOptionsText={mediaLoading ? 'Loading audio...' : 'No audio found. Upload one below.'}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Audio'
                            placeholder='Search or select audio'
                            error={Boolean(errors.audio)}
                            helperText={errors.audio ? 'This field is required.' : undefined}
                          />
                        )}
                      />
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<i className='ri-upload-line' />}
                        onClick={() => setShowAudioUpload(!showAudioUpload)}
                        sx={{ mt: 2 }}
                      >
                        {showAudioUpload ? 'Cancel Upload' : 'Upload New Audio'}
                      </Button>
                      {showAudioUpload && (
                        <Grid
                          container
                          spacing={2}
                          sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                        >
                          <Grid size={{ xs: 12 }}>
                            <Typography variant='subtitle2' gutterBottom>
                              Upload New Audio
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label='Audio Title'
                              value={audioTitle}
                              onChange={(e) => setAudioTitle(e.target.value)}
                              placeholder={stepTitle || 'Enter audio title'}
                              helperText='Leave empty to use step title'
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              type='file'
                              label='Audio File'
                              InputLabelProps={{ shrink: true }}
                              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                              inputProps={{ accept: 'audio/*' }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              variant='contained'
                              onClick={async () => {
                                if (!audioFile) {
                                  toast.error('Please select an audio file')
                                  return
                                }
                                try {
                                  setUploadingAudio(true)
                                  const fd = new FormData()
                                  fd.append('video', audioFile)
                                  fd.append('title', audioTitle || stepTitle || 'New Audio')
                                  fd.append('mediaType', 'audio')
                                  fd.append('orientation', 'portrait')
                                  fd.append('isActive', 'true')
                                  const response = await adminAPI.createMedia(fd)
                                  const newAudio = response.data?.media
                                  if (newAudio) {
                                    await loadMedia()
                                    setValue('audio', newAudio._id)
                                    toast.success('Audio uploaded and selected successfully')
                                    setShowAudioUpload(false)
                                    setAudioFile(null)
                                    setAudioTitle('')
                                  }
                                } catch (error) {
                                  toast.error(error.message || 'Error uploading audio')
                                } finally {
                                  setUploadingAudio(false)
                                }
                              }}
                              disabled={!audioFile || uploadingAudio}
                              startIcon={
                                uploadingAudio ? (
                                  <i className='ri-loader-4-line animate-spin' />
                                ) : (
                                  <i className='ri-upload-line' />
                                )
                              }
                            >
                              {uploadingAudio ? 'Uploading...' : 'Upload Audio'}
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='timer'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Timer (seconds)'
                    placeholder='30'
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                    {...(errors.timer && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='restTime'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Rest Time (seconds)'
                    placeholder='0'
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name='order'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Order'
                    placeholder='1'
                    onChange={(e) => {
                      setIsOrderManuallyEdited(true)
                      field.onChange(parseInt(e.target.value) || 1)
                    }}
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

export default AddStepDialog
