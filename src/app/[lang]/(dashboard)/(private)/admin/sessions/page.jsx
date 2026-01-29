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
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sessRes, seqRes] = await Promise.all([
        adminAPI.getSessions(),
        adminAPI.getSequences()
      ])
      setSessions(sessRes.data.sessions || [])
      setSequences(seqRes.data.sequences || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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

  return (
    <SessionList
      sessionData={sessions}
      sequences={sequences}
      onRefresh={fetchData}
    />
  )
}

export default AdminSessions
