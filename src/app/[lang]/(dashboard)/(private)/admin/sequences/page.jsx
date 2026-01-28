'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import SequenceList from '@views/admin/sequences'
import { adminAPI } from '@/utils/api'

const AdminSequences = () => {
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSequences = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSequences()
      setSequences(response.data.sequences || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching sequences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSequences()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading sequences...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <SequenceList sequenceData={sequences} onRefresh={fetchSequences} />
}

export default AdminSequences
