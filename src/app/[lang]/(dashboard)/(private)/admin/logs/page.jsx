'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import LogList from '@views/admin/logs'
import { adminAPI } from '@/utils/api'

const AdminLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getLogs({ page: 1, limit: 1000 })
      setLogs(response.data.logs || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading logs...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <LogList logData={logs} onRefresh={fetchLogs} />
}

export default AdminLogs
