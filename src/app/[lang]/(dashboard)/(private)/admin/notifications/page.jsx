'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import NotificationList from '@views/admin/notifications'
import { adminAPI } from '@/utils/api'
import { useAuthToken } from '@/hooks/useAuthToken'

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { isReady, isLoading } = useAuthToken()

  const fetchNotifications = async () => {
    if (!isReady || isLoading) return

    try {
      setLoading(true)
      const response = await adminAPI.getNotifications({ page: 1, limit: 1000 })
      // Transform data to match template format
      const transformedNotifications = (response.data.notifications || []).map(notification => ({
        id: notification._id,
        user: notification.user?.name || notification.user?.email || 'Unknown',
        userEmail: notification.user?.email || '',
        type: notification.type || 'general',
        title: notification.title || '',
        message: notification.message || '',
        isRead: notification.isRead || false,
        readAt: notification.readAt || null,
        scheduledFor: notification.scheduledFor || notification.createdAt,
        sentAt: notification.sentAt || null,
        actionUrl: notification.actionUrl || null,
        createdAt: notification.createdAt,
        ...notification
      }))
      setNotifications(transformedNotifications)
    } catch (error) {
      toast.error(error.message || 'Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isReady, isLoading])

  if (loading || isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <div className='flex items-center justify-center p-8'>
            <Typography>Loading notifications...</Typography>
          </div>
        </Grid>
      </Grid>
    )
  }

  return <NotificationList notificationData={notifications} onRefresh={fetchNotifications} />
}

export default AdminNotifications

