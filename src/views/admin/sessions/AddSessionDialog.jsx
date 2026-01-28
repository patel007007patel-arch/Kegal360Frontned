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

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const AddSessionDialog = ({ open, handleClose, onRefresh }) => {
  const [loading, setLoading] = useState(false)
  const [sequences, setSequences] = useState([])

  useEffect(() => {
    if (open) {
      adminAPI.getSequences().then(res => {
        setSequences(res.data.sequences || [])
      }).catch(() => {})
    }
  }, [open])

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      sequence: '',
      sessionType: 'yoga',
      title: '',
      description: '',
      benefits: [],
      thumbnail: '',
      difficulty: 'beginner',
      equipment: 'Equipment-free',
      order: 1,
      isActive: true,
      isFree: true
    }
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await adminAPI.createSession(data)
      toast.success('Session created successfully')
      handleClose()
      resetForm()
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating session')
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
        Add New Session
        <Typography component='span' className='flex flex-col text-center'>
          Add a new session to the system
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
                name='sequence'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='sequence-label'>Sequence</InputLabel>
                    <Select {...field} label='Sequence' labelId='sequence-label' error={Boolean(errors.sequence)}>
                      {sequences.map((seq) => (
                        <MenuItem key={seq._id} value={seq._id}>
                          {seq.displayName || seq.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sequence && <Typography variant='caption' color='error'>This field is required.</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='sessionType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='session-type-label'>Session Type</InputLabel>
                    <Select {...field} label='Session Type' labelId='session-type-label'>
                      <MenuItem value='yoga'>Yoga</MenuItem>
                      <MenuItem value='workout'>Workout</MenuItem>
                      <MenuItem value='meditation'>Meditation</MenuItem>
                      <MenuItem value='breathwork'>Breathwork</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='difficulty'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='difficulty-label'>Difficulty</InputLabel>
                    <Select {...field} label='Difficulty' labelId='difficulty-label'>
                      <MenuItem value='beginner'>Beginner</MenuItem>
                      <MenuItem value='intermediate'>Intermediate</MenuItem>
                      <MenuItem value='advanced'>Advanced</MenuItem>
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
                    placeholder='Gentle Support'
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
                    placeholder='Description of the session'
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
                name='order'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Order'
                    placeholder='1'
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='thumbnail'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Thumbnail URL'
                    placeholder='https://...'
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='isFree'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label='Free'
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

export default AddSessionDialog
