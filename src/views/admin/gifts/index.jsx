// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import GiftListTable from './GiftListTable'

const GiftList = ({ giftData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <GiftListTable tableData={giftData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default GiftList

