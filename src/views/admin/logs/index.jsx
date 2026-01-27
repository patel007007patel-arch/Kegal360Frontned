// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import LogListTable from './LogListTable'

const LogList = ({ logData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LogListTable tableData={logData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default LogList

