'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import VideoList from '@views/admin/videos'
import { adminAPI } from '@/utils/api'

const AdminVideos = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getVideos({ page: 1, limit: 1000 })
      setVideos(response.data.videos || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading videos...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <VideoList videoData={videos} onRefresh={fetchVideos} />
}

export default AdminVideos
