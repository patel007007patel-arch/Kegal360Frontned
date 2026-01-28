'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import SessionList from '@views/admin/sessions'
import { adminAPI } from '@/utils/api'

const AdminSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSessions()
      setSessions(response.data.sessions || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading sessions...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <SessionList sessionData={sessions} onRefresh={fetchSessions} />
}

export default AdminSessions
