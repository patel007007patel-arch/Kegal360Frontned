'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import SubscriptionList from '@views/admin/subscriptions'
import { adminAPI } from '@/utils/api'

// Hooks
import { useAuthToken } from '@/hooks/useAuthToken'

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const { isReady, isLoading } = useAuthToken()

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSubscriptions({ page: 1, limit: 1000 })
      setSubscriptions(response.data.subscriptions || [])
    } catch (error) {
      toast.error(error.message || 'Error fetching subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isReady && !isLoading) {
      fetchSubscriptions()
    }
  }, [isReady, isLoading])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading subscriptions...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <SubscriptionList subscriptionData={subscriptions} onRefresh={fetchSubscriptions} />
}

export default AdminSubscriptions
