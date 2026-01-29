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

const AddSequenceDialog = ({ open, handleClose, onRefresh, initialCyclePhaseId = null }) => {
  const [loading, setLoading] = useState(false)
  const [cyclePhases, setCyclePhases] = useState([])

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      cyclePhase: '',
      name: '',
      displayName: '',
      description: '',
      thumbnail: '',
      order: 1,
      isActive: true
    }
  })

  useEffect(() => {
    if (open) {
      adminAPI.getCyclePhases().then(res => {
        setCyclePhases(res.data.cyclePhases || [])
      }).catch(() => {})
      resetForm({
        cyclePhase: initialCyclePhaseId || '',
        name: '',
        displayName: '',
        description: '',
        thumbnail: '',
        order: 1,
        isActive: true
      })
    }
  }, [open, initialCyclePhaseId, resetForm])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await adminAPI.createSequence(data)
      toast.success('Sequence created successfully')
      handleClose()
      resetForm({ cyclePhase: '', name: '', displayName: '', description: '', thumbnail: '', order: 1, isActive: true })
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating sequence')
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
        Add New Sequence
        <Typography component='span' className='flex flex-col text-center'>
          Add a new sequence to the system
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
                name='cyclePhase'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='cycle-phase-label'>Cycle Phase</InputLabel>
                    <Select {...field} label='Cycle Phase' labelId='cycle-phase-label' error={Boolean(errors.cyclePhase)}>
                      {cyclePhases.map((phase) => (
                        <MenuItem key={phase._id} value={phase._id}>
                          {phase.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cyclePhase && <Typography variant='caption' color='error'>This field is required.</Typography>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Name (Internal)'
                    placeholder='sequence-1'
                    {...(errors.name && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='displayName'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Display Name'
                    placeholder='Menstrual Sequence 1'
                    {...(errors.displayName && { error: true, helperText: 'This field is required.' })}
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
                    placeholder='Description of the sequence'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
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

export default AddSequenceDialog
