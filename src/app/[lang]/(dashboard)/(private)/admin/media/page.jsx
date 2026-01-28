'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import MediaList from '@views/admin/media'
import { adminAPI } from '@/utils/api'

const AdminMedia = () => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getMedia()
      setMedia(response.data.media || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading media library...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <MediaList mediaData={media} onRefresh={fetchMedia} />
}

export default AdminMedia
