'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import UserList from '@views/admin/users'
import { adminAPI } from '@/utils/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers({ page: 1, limit: 1000 })
      // Transform data to match template format
      const transformedUsers = (response.data.users || []).map(user => ({
        id: user._id,
        fullName: user.name || 'N/A',
        username: user.email?.split('@')[0] || '',
        email: user.email,
        role: user.role || 'user',
        currentPlan: user.subscription?.plan || 'free',
        status: user.isActive ? 'active' : 'inactive',
        avatar: null,
        ...user
      }))
      setUsers(transformedUsers)
    } catch (error) {
      toast.error(error.message || 'Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading users...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <UserList userData={users} onRefresh={fetchUsers} />
}

export default AdminUsers
