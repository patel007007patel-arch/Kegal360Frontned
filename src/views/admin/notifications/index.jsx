// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import NotificationListTable from './NotificationListTable'

const NotificationList = ({ notificationData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <NotificationListTable tableData={notificationData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default NotificationList

