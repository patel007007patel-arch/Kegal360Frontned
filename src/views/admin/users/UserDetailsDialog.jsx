'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { toast } from 'react-toastify'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { adminAPI } from '@/utils/api'
import { getInitials } from '@/utils/getInitials'

const UserDetailsDialog = ({ open, onClose, user: initialUser }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && initialUser?._id) {
      setLoading(true)
      adminAPI
        .getUserById(initialUser._id)
        .then(res => {
          const data = res?.data?.user
          setUser(data || initialUser)
        })
        .catch(() => {
          setUser(initialUser)
          toast.error('Could not load full details')
        })
        .finally(() => setLoading(false))
    } else {
      setUser(initialUser || null)
    }
  }, [open, initialUser])

  if (!user) return null

  const displayName = user.name || user.fullName || user.email || '—'
  const stats = user.stats || {}

  const DetailRow = ({ label, value, type }) => {
    let display = value
    if (value === undefined || value === null || value === '') display = '—'
    else if (type === 'date' && value) display = new Date(value).toLocaleString()
    else if (type === 'boolean') display = value ? 'Yes' : 'No'
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant='caption' color='text.secondary' display='block'>
          {label}
        </Typography>
        <Typography variant='body2' color='text.primary'>
          {display}
        </Typography>
      </Grid>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth scroll='paper'>
      <DialogTitle className='flex items-center justify-between gap-2'>
        <span>User Details</span>
        <IconButton size='small' onClick={onClose} aria-label='close'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box className='flex justify-center items-center p-6'>
            <Typography color='text.secondary'>Loading...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Profile header */}
            <Grid size={{ xs: 12 }}>
              <Box className='flex items-center gap-3 p-3 rounded-lg bg-actionHover'>
                <CustomAvatar skin='light' size={56} src={user.profilePicture}>
                  {!user.profilePicture && getInitials(displayName)}
                </CustomAvatar>
                <div>
                  <Typography variant='h6'>{displayName}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {user.email}
                  </Typography>
                  <Box className='flex gap-1 mt-1'>
                    <Chip
                      size='small'
                      label={user.role || 'user'}
                      color={user.role === 'admin' ? 'error' : 'primary'}
                      variant='tonal'
                    />
                    <Chip
                      size='small'
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      variant='tonal'
                    />
                  </Box>
                </div>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' color='text.secondary' className='mb-2'>
                Account
              </Typography>
              <Divider className='mbe-2' />
            </Grid>
            <DetailRow label='Email' value={user.email} />
            <DetailRow label='Name' value={user.name || user.fullName} />
            <DetailRow label='Birth Year' value={user.birthYear} />
            <DetailRow label='Role' value={user.role} />
            <DetailRow label='App For' value={user.appFor} />
            <DetailRow label='Social Login' value={user.socialProvider} />
            <DetailRow label='Onboarding Completed' value={user.onboardingCompleted} type='boolean' />
            <DetailRow label='Last Login' value={user.lastLogin} type='date' />
            <DetailRow label='Created' value={user.createdAt} type='date' />
            <DetailRow label='Updated' value={user.updatedAt} type='date' />

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' color='text.secondary' className='mb-2 mt-2'>
                Cycle preferences
              </Typography>
              <Divider className='mbe-2' />
            </Grid>
            <DetailRow label='Track Cycle' value={user.trackCycle} type='boolean' />
            <DetailRow label='Cycle Type' value={user.cycleType} />
            <DetailRow label='Cycle Length (days)' value={user.cycleLength} />
            <DetailRow label='Period Length (days)' value={user.periodLength} />
            {user.cycleLengthRange?.min != null && (
              <DetailRow
                label='Cycle Length Range'
                value={`${user.cycleLengthRange.min}–${user.cycleLengthRange.max} days`}
              />
            )}
            <DetailRow label='Last Period Start' value={user.lastPeriodStart} type='date' />
            <DetailRow label='Last Period End' value={user.lastPeriodEnd} type='date' />
            <DetailRow label='Partner Code' value={user.partnerCode} />

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' color='text.secondary' className='mb-2 mt-2'>
                Stats & subscription
              </Typography>
              <Divider className='mbe-2' />
            </Grid>
            <DetailRow label='Logs count' value={stats.logCount} />
            <DetailRow label='Cycles count' value={stats.cycleCount} />
            <DetailRow
              label='Subscription plan'
              value={
                stats.subscription?.plan ||
                user.subscription?.plan ||
                (user.subscription && typeof user.subscription === 'object' ? user.subscription.plan : null)
              }
            />
            <DetailRow
              label='Subscription active'
              value={
                stats.subscription?.isActive ??
                user.subscription?.isActive ??
                (user.subscription && typeof user.subscription === 'object' ? user.subscription.isActive : null)
              }
              type='boolean'
            />
            {stats.subscription?.endDate && (
              <DetailRow label='Subscription end' value={stats.subscription.endDate} type='date' />
            )}

            <Grid size={{ xs: 12 }}>
              <Typography variant='subtitle2' color='text.secondary' className='mb-2 mt-2'>
                Settings
              </Typography>
              <Divider className='mbe-2' />
            </Grid>
            <DetailRow
              label='Push notifications'
              value={user.settings?.pushNotifications}
              type='boolean'
            />
            <DetailRow label='Dark theme' value={user.settings?.darkTheme} type='boolean' />
            <DetailRow label='Email updates' value={user.settings?.emailUpdates} type='boolean' />
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsDialog
