// React Imports
import { useState, useEffect, useMemo } from 'react'

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
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Autocomplete from '@mui/material/Autocomplete'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const AddNotificationDialog = props => {
  // Props
  const { open, setOpen, onRefresh } = props

  // States
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [recipientType, setRecipientType] = useState('single') // 'single', 'multiple', 'all'
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [userSearch, setUserSearch] = useState('') // search for multiple users list

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      userId: '',
      type: '',
      title: '',
      message: '',
      scheduledFor: '',
      actionUrl: ''
    }
  })

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers({ page: 1, limit: 1000 })
        setUsers(response.data.users || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    if (open) {
      fetchUsers()
    }
  }, [open])

  const onSubmit = async data => {
    try {
      setLoading(true)
      
      let notificationData = {
        type: data.type,
        title: data.title,
        message: data.message,
        scheduledFor: data.scheduledFor || new Date().toISOString(),
        actionUrl: data.actionUrl || undefined
      }

      // Set recipient based on recipient type
      if (recipientType === 'all') {
        notificationData.sendToAll = true
      } else if (recipientType === 'multiple') {
        if (selectedUserIds.length === 0) {
          toast.error('Please select at least one user')
          setLoading(false)
          return
        }
        notificationData.userIds = selectedUserIds
      } else {
        if (!data.userId) {
          toast.error('Please select a user')
          setLoading(false)
          return
        }
        notificationData.userId = data.userId
      }

      const response = await adminAPI.createNotification(notificationData)
      toast.success(response.data.message || 'Notification created successfully')
      handleClose()
      resetForm({
        userId: '',
        type: '',
        title: '',
        message: '',
        scheduledFor: '',
        actionUrl: ''
      })
      setRecipientType('single')
      setSelectedUserIds([])
      setUserSearch('')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error creating notification')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    resetForm({
      userId: '',
      type: '',
      title: '',
      message: '',
      scheduledFor: '',
      actionUrl: ''
    })
    setRecipientType('single')
    setSelectedUserIds([])
    setUserSearch('')
  }

  const handleUserToggle = (userId) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(users.map(user => user._id))
    }
  }

  // Filtered users for multiple selection (search by name or email)
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase().trim()
    return users.filter(
      u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    )
  }, [users, userSearch])

  const handleSelectAllVisible = () => {
    const visibleIds = filteredUsers.map(u => u._id)
    const allVisibleSelected = visibleIds.every(id => selectedUserIds.includes(id))
    if (allVisibleSelected) {
      setSelectedUserIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...visibleIds])])
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={handleClose}
      closeAfterTransition={false}
    >
      <DialogTitle className='flex items-center justify-between'>
        <Typography variant='h5' component='span'>Add New Notification</Typography>
        <IconButton size='small' onClick={handleClose} className='absolute inline-end-4 block-start-4'>
          <i className='ri-close-line text-xl' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='flex flex-col gap-4 pbs-6' sx={{ overflow: 'visible' }}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' className='mbe-2'>Recipient Type *</Typography>
              <RadioGroup
                row
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value)
                  setSelectedUserIds([])
                  setUserSearch('')
                }}
              >
                <FormControlLabel value='single' control={<Radio />} label='Single User' />
                <FormControlLabel value='multiple' control={<Radio />} label='Multiple Users' />
                <FormControlLabel value='all' control={<Radio />} label='All Users' />
              </RadioGroup>
            </Grid>

            {recipientType === 'all' && (
              <Grid size={{ xs: 12 }}>
                <Alert severity='info'>
                  This notification will be sent to all active users ({users.length} users)
                </Alert>
              </Grid>
            )}

            {recipientType === 'single' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name='userId'
                  control={control}
                  rules={{ required: recipientType === 'single' ? 'User is required' : false }}
                  render={({ field }) => (
                    <Autocomplete
                      options={users}
                      getOptionLabel={option => (option && `${option.name || option.email} (${option.email})`) || ''}
                      value={users.find(u => u._id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue ? newValue._id : '')}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(
                          u =>
                            (u.name || '').toLowerCase().includes((inputValue || '').toLowerCase()) ||
                            (u.email || '').toLowerCase().includes((inputValue || '').toLowerCase())
                        )
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label='User *'
                          placeholder='Search by name or email...'
                          error={!!errors.userId}
                          helperText={errors.userId?.message}
                        />
                      )}
                      noOptionsText='No users found. Try another search.'
                    />
                  )}
                />
              </Grid>
            )}

            {recipientType === 'multiple' && (
              <Grid size={{ xs: 12 }}>
                <Box>
                  <Typography variant='body2' className='mbe-2' color='text.secondary'>
                    Select Users * <span className='text-error'>({selectedUserIds.length} selected)</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Search users by name or email...'
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className='mbe-2'
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='ri-search-line text-textSecondary' />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                  <Box 
                    className='border rounded p-4' 
                    sx={{ 
                      maxHeight: 300, 
                      overflow: 'auto',
                      borderColor: 'var(--mui-palette-divider)',
                      '&:hover': {
                        borderColor: 'var(--mui-palette-action-active)'
                      }
                    }}
                  >
                    <Box className='flex items-center justify-between mbe-2'>
                      <Typography variant='body2' className='font-medium'>
                        {selectedUserIds.length === 0 ? 'No users selected' : `${selectedUserIds.length} user${selectedUserIds.length > 1 ? 's' : ''} selected`}
                        {userSearch && ` · ${filteredUsers.length} match${filteredUsers.length !== 1 ? 'es' : ''}`}
                      </Typography>
                      <Box className='flex gap-1'>
                        <Button size='small' onClick={handleSelectAllVisible}>
                          {filteredUsers.every(u => selectedUserIds.includes(u._id))
                            ? 'Deselect visible'
                            : 'Select visible'}
                        </Button>
                        <Button size='small' onClick={handleSelectAll}>
                          {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Box>
                    </Box>
                    <Divider className='mbe-2' />
                    <List dense>
                      {filteredUsers.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary={userSearch ? 'No users match your search' : 'No users available'}
                            secondary={userSearch ? 'Try a different name or email' : ''}
                          />
                        </ListItem>
                      ) : (
                        filteredUsers.map(user => (
                          <ListItem key={user._id} disablePadding>
                            <ListItemButton
                              onClick={() => handleUserToggle(user._id)}
                              selected={selectedUserIds.includes(user._id)}
                            >
                              <Checkbox
                                checked={selectedUserIds.includes(user._id)}
                                edge='start'
                              />
                              <ListItemText
                                primary={user.name || user.email}
                                secondary={user.email}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Box>
                  {selectedUserIds.length > 0 && (
                    <Box className='flex flex-wrap gap-1 mts-2'>
                      {selectedUserIds.slice(0, 5).map(userId => {
                        const user = users.find(u => u._id === userId)
                        return (
                          <Chip
                            key={userId}
                            label={user?.name || user?.email}
                            size='small'
                            onDelete={() => handleUserToggle(userId)}
                          />
                        )
                      })}
                      {selectedUserIds.length > 5 && (
                        <Chip label={`+${selectedUserIds.length - 5} more`} size='small' />
                      )}
                    </Box>
                  )}
                  {selectedUserIds.length === 0 && (
                    <FormHelperText error className='mts-1'>Please select at least one user</FormHelperText>
                  )}
                </Box>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id='type-select'>Notification Type *</InputLabel>
                <Controller
                  name='type'
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <Select {...field} label='Notification Type *' labelId='type-select'>
                      <MenuItem value=''>Select Type</MenuItem>
                      <MenuItem value='period_reminder'>Period Reminder</MenuItem>
                      <MenuItem value='ovulation_reminder'>Ovulation Reminder</MenuItem>
                      <MenuItem value='log_reminder'>Log Reminder</MenuItem>
                      <MenuItem value='yoga_reminder'>Yoga Reminder</MenuItem>
                      <MenuItem value='meditation_reminder'>Meditation Reminder</MenuItem>
                      <MenuItem value='subscription'>Subscription</MenuItem>
                      <MenuItem value='general'>General</MenuItem>
                    </Select>
                  )}
                />
                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name='scheduledFor'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='datetime-local'
                    label='Scheduled For'
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Title *'
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='message'
                control={control}
                rules={{ required: 'Message is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label='Message *'
                    error={!!errors.message}
                    helperText={errors.message?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='actionUrl'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Action URL (Optional)'
                    placeholder='/admin/users'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-between pbs-0 sm:pbe-6 sm:pli-16'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Creating...' : 'Create Notification'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddNotificationDialog

