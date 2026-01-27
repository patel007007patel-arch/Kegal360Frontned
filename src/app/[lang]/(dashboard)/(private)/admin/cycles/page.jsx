'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import CycleList from '@views/admin/cycles'
import { adminAPI } from '@/utils/api'

const AdminCycles = () => {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCycles = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getCycles({ page: 1, limit: 1000 })
      setCycles(response.data.cycles || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching cycles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCycles()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading cycles...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <CycleList cycleData={cycles} onRefresh={fetchCycles} />
}

export default AdminCycles

