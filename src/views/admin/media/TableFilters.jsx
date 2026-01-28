// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const TableFilters = ({ setData, tableData }) => {
  // States
  const [mediaType, setMediaType] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(item => {
      if (mediaType && item.mediaType !== mediaType) return false
      if (status) {
        const itemStatus = item.isActive ? 'active' : 'inactive'
        if (itemStatus !== status) return false
      }

      return true
    })

    setData(filteredData || [])
  }, [mediaType, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='media-type-select'>Media Type</InputLabel>
            <Select
              fullWidth
              id='select-media-type'
              value={mediaType}
              onChange={e => setMediaType(e.target.value)}
              label='Media Type'
              labelId='media-type-select'
              inputProps={{ placeholder: 'Select Media Type' }}
            >
              <MenuItem value=''>All Types</MenuItem>
              <MenuItem value='video'>Video</MenuItem>
              <MenuItem value='audio'>Audio</MenuItem>
              <MenuItem value='image'>Image</MenuItem>
              <MenuItem value='animation'>Animation</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
            >
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
