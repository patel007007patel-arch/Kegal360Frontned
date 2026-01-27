// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import CycleListTable from './CycleListTable'

const CycleList = ({ cycleData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CycleListTable tableData={cycleData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default CycleList

