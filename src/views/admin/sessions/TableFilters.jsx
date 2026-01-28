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
  const [sessionType, setSessionType] = useState('')
  const [status, setStatus] = useState('')
  const [isFree, setIsFree] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(item => {
      if (sessionType && item.sessionType !== sessionType) return false
      if (status) {
        const itemStatus = item.isActive ? 'active' : 'inactive'
        if (itemStatus !== status) return false
      }
      if (isFree !== '') {
        const itemIsFree = item.isFree ? 'free' : 'premium'
        if (itemIsFree !== isFree) return false
      }

      return true
    })

    setData(filteredData || [])
  }, [sessionType, status, isFree, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='session-type-select'>Session Type</InputLabel>
            <Select
              fullWidth
              id='select-session-type'
              value={sessionType}
              onChange={e => setSessionType(e.target.value)}
              label='Session Type'
              labelId='session-type-select'
              inputProps={{ placeholder: 'Select Session Type' }}
            >
              <MenuItem value=''>All Types</MenuItem>
              <MenuItem value='yoga'>Yoga</MenuItem>
              <MenuItem value='workout'>Workout</MenuItem>
              <MenuItem value='meditation'>Meditation</MenuItem>
              <MenuItem value='breathwork'>Breathwork</MenuItem>
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='is-free-select'>Pricing</InputLabel>
            <Select
              fullWidth
              id='select-is-free'
              label='Pricing'
              value={isFree}
              onChange={e => setIsFree(e.target.value)}
              labelId='is-free-select'
              inputProps={{ placeholder: 'Select Pricing' }}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='free'>Free</MenuItem>
              <MenuItem value='premium'>Premium</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
