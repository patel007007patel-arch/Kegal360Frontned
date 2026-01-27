// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import SubscriptionListTable from './SubscriptionListTable'

const SubscriptionList = ({ subscriptionData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SubscriptionListTable tableData={subscriptionData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default SubscriptionList

