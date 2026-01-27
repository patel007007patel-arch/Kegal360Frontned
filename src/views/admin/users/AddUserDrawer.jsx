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
import Grid from '@mui/material/Grid'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

// Vars
const initialData = {
  company: '',
  country: '',
  contact: ''
}

const AddUserDrawer = props => {
  // Props
  const { open, handleClose, onRefresh } = props

  // States
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: '',
      plan: '',
      status: ''
    }
  })

  const onSubmit = async data => {
    try {
      setLoading(true)
      const userData = {
        name: data.fullName,
        email: data.email,
        password: data.password || 'defaultPassword123',
        role: data.role || 'user',
        isActive: data.status === 'active',
        subscription: data.plan && data.plan !== 'free' ? {
          plan: data.plan,
          isActive: data.status === 'active'
        } : undefined
      }

      await adminAPI.createUser(userData)
      toast.success('User created successfully')
      handleClose()
      setFormData(initialData)
      resetForm({ fullName: '', username: '', email: '', role: '', plan: '', status: '', password: '' })
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating user')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    setFormData(initialData)
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
        Add New User
        <Typography component='span' className='flex flex-col text-center'>
          Add a new user to the system
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(data => onSubmit(data))}>
        <DialogContent className='pbs-0 sm:pbe-6 sm:pli-16'>
          <IconButton onClick={handleReset} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='fullName'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Full Name'
                    placeholder='John Doe'
                    {...(errors.fullName && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='username'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Username'
                    placeholder='johndoe'
                    {...(errors.username && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email'
                    placeholder='johndoe@gmail.com'
                    {...(errors.email && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='password'
                    label='Password'
                    placeholder='Enter password'
                    {...(errors.password && { error: true, helperText: 'This field is required.' })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel id='role-label' error={Boolean(errors.role)}>
                  Select Role
                </InputLabel>
                <Controller
                  name='role'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select label='Select Role' {...field} error={Boolean(errors.role)} labelId='role-label'>
                      <MenuItem value='admin'>Admin</MenuItem>
                      <MenuItem value='user'>User</MenuItem>
                    </Select>
                  )}
                />
                {errors.role && <FormHelperText error>This field is required.</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel id='plan-label' error={Boolean(errors.plan)}>
                  Select Plan
                </InputLabel>
                <Controller
                  name='plan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select label='Select Plan' {...field} error={Boolean(errors.plan)} labelId='plan-label'>
                      <MenuItem value='free'>Free</MenuItem>
                      <MenuItem value='monthly'>Monthly</MenuItem>
                      <MenuItem value='yearly'>Yearly</MenuItem>
                    </Select>
                  )}
                />
                {errors.plan && <FormHelperText error>This field is required.</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel id='status-label' error={Boolean(errors.status)}>
                  Select Status
                </InputLabel>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select label='Select Status' {...field} error={Boolean(errors.status)} labelId='status-label'>
                      <MenuItem value='pending'>Pending</MenuItem>
                      <MenuItem value='active'>Active</MenuItem>
                      <MenuItem value='inactive'>Inactive</MenuItem>
                    </Select>
                  )}
                />
                {errors.status && <FormHelperText error>This field is required.</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label='Company'
                fullWidth
                placeholder='Company PVT LTD'
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id='country'>Select Country</InputLabel>
                <Select
                  fullWidth
                  id='country'
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  label='Select Country'
                  labelId='country'
                >
                  <MenuItem value='India'>India</MenuItem>
                  <MenuItem value='USA'>USA</MenuItem>
                  <MenuItem value='Australia'>Australia</MenuItem>
                  <MenuItem value='Germany'>Germany</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label='Contact'
                type='number'
                fullWidth
                placeholder='(397) 294-5153'
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
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

export default AddUserDrawer

