'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import CyclePhaseList from '@views/admin/cyclePhases'
import { adminAPI } from '@/utils/api'

const AdminCyclePhases = () => {
  const [cyclePhases, setCyclePhases] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCyclePhases = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getCyclePhases()
      setCyclePhases(response.data.cyclePhases || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching cycle phases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCyclePhases()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading cycle phases...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <CyclePhaseList cyclePhaseData={cyclePhases} onRefresh={fetchCyclePhases} />
}

export default AdminCyclePhases
