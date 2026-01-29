'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import StepList from '@views/admin/steps'
import { adminAPI } from '@/utils/api'

const AdminSteps = () => {
  const [steps, setSteps] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [stepsRes, sessRes] = await Promise.all([
        adminAPI.getSteps(),
        adminAPI.getSessions()
      ])
      setSteps(stepsRes.data.steps || [])
      setSessions(sessRes.data.sessions || [])
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
            <Typography>Loading steps...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return (
    <StepList
      stepData={steps}
      sessions={sessions}
      onRefresh={fetchData}
    />
  )
}

export default AdminSteps
