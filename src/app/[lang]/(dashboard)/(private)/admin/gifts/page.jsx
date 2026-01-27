'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import GiftList from '@views/admin/gifts'
import { adminAPI } from '@/utils/api'

const AdminGifts = () => {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGifts = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getGifts({ page: 1, limit: 1000 })
      setGifts(response.data.gifts || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching gifts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading gifts...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <GiftList giftData={gifts} onRefresh={fetchGifts} />
}

export default AdminGifts
