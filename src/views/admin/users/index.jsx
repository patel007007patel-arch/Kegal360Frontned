// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserListTable from './UserListTable'

const UserList = ({ userData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={userData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default UserList

