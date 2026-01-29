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
  const [cyclePhases, setCyclePhases] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [seqRes, phaseRes] = await Promise.all([
        adminAPI.getSequences(),
        adminAPI.getCyclePhases()
      ])
      setSequences(seqRes.data.sequences || [])
      setCyclePhases(phaseRes.data.cyclePhases || [])
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
            <Typography>Loading sequences...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return (
    <SequenceList
      sequenceData={sequences}
      cyclePhases={cyclePhases}
      onRefresh={fetchData}
    />
  )
}

export default AdminSequences
