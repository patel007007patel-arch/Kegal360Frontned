'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { toast } from 'react-toastify'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { authAPI, adminAPI } from '@/utils/api'

const AdminProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getMe()
        const user = res?.data?.user
        if (user) {
          setProfile(user)
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const openEdit = () => {
    setEditName(profile?.name || '')
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!profile?.id) return
    try {
      setSaving(true)
      await adminAPI.updateUser(profile.id, { name: editName })
      setProfile(prev => (prev ? { ...prev, name: editName } : null))
      toast.success('Profile updated successfully')
      setEditOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.name || '—'
  const displayEmail = profile?.email || '—'
  const displayRole = profile?.role === 'admin' ? 'Administrator' : (profile?.role || '—')
  const initials = (profile?.name || 'A').trim().slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <Box>
        <Card>
          <CardContent>
            <Typography color='text.secondary'>Loading profile...</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (!profile) {
    return (
      <Box>
        <Card>
          <CardContent>
            <Typography color='text.secondary'>Could not load profile.</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box>
      {/* Page header */}
      <Box className='flex flex-wrap items-center justify-between gap-4 mbe-6'>
        <Typography variant='h4' fontWeight={600}>
          Admin Profile
        </Typography>
      </Box>

      {/* Main profile card */}
      <Card>
        <CardContent className='p-6 sm:p-8'>
          {/* Top: Avatar + Name + Email */}
          <Box className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mbe-8'>
            <CustomAvatar skin='light' color='primary' size={80} className='shrink-0'>
              <Typography fontWeight={600} fontSize='1.25rem'>
                {initials}
              </Typography>
            </CustomAvatar>
            <Box>
              <Typography variant='h4' fontWeight={600} className='mbe-1'>
                {displayName}
              </Typography>
              <Typography color='text.secondary'>{displayEmail}</Typography>
            </Box>
          </Box>

          {/* Bottom: Account Information + Security */}
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle1' fontWeight={600} className='mbe-3'>
                Account Information
              </Typography>
              <Box className='flex flex-col gap-3'>
                <Box className='flex justify-between items-center gap-4'>
                  <Typography color='text.secondary'>Email:</Typography>
                  <Typography fontWeight={500}>{displayEmail}</Typography>
                </Box>
                <Box className='flex justify-between items-center gap-4'>
                  <Typography color='text.secondary'>Name:</Typography>
                  <Typography fontWeight={500}>{displayName}</Typography>
                </Box>
                <Box className='flex justify-between items-center gap-4'>
                  <Typography color='text.secondary'>Role:</Typography>
                  <Typography fontWeight={500}>{displayRole}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant='subtitle1' fontWeight={600} className='mbe-3'>
                Security
              </Typography>
              <Box className='flex flex-col gap-3'>
                <Box className='flex justify-between items-center gap-4 flex-wrap'>
                  <Typography color='text.secondary'>Password:</Typography>
                  <Button
                    variant='text'
                    color='primary'
                    size='small'
                    className='p-0 min-is-0'
                    onClick={() => toast.info('Change password coming soon')}
                  >
                    Change Password
                  </Button>
                </Box>
                <Box className='flex justify-between items-center gap-4'>
                  <Typography color='text.secondary'>Two-Factor:</Typography>
                  <Typography fontWeight={500}>Not enabled</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Profile dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          <TextField
            fullWidth
            label='Name'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder='Your name'
            className='mts-2'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleEditSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminProfile
