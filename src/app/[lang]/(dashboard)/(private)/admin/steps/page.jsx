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
  const [loading, setLoading] = useState(true)

  const fetchSteps = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSteps()
      setSteps(response.data.steps || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching steps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSteps()
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

  return <StepList stepData={steps} onRefresh={fetchSteps} />
}

export default AdminSteps
