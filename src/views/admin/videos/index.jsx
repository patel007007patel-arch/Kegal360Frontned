// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import VideoListTable from './VideoListTable'

const VideoList = ({ videoData, onRefresh }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <VideoListTable tableData={videoData} onRefresh={onRefresh} />
      </Grid>
    </Grid>
  )
}

export default VideoList

