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
  const [type, setType] = useState('')
  const [phase, setPhase] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(video => {
      if (type && video.type !== type) return false
      if (phase && video.phase !== phase) return false
      if (status) {
        const videoStatus = video.isActive ? 'active' : 'inactive'
        if (videoStatus !== status) return false
      }

      return true
    })

    setData(filteredData || [])
  }, [type, phase, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='type-select'>Select Type</InputLabel>
            <Select
              fullWidth
              id='select-type'
              value={type}
              onChange={e => setType(e.target.value)}
              label='Select Type'
              labelId='type-select'
              inputProps={{ placeholder: 'Select Type' }}
            >
              <MenuItem value=''>Select Type</MenuItem>
              <MenuItem value='yoga'>Yoga</MenuItem>
              <MenuItem value='meditation'>Meditation</MenuItem>
              <MenuItem value='exercise'>Exercise</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='phase-select'>Select Phase</InputLabel>
            <Select
              fullWidth
              id='select-phase'
              value={phase}
              onChange={e => setPhase(e.target.value)}
              label='Select Phase'
              labelId='phase-select'
              inputProps={{ placeholder: 'Select Phase' }}
            >
              <MenuItem value=''>Select Phase</MenuItem>
              <MenuItem value='menstrual'>Menstrual</MenuItem>
              <MenuItem value='follicular'>Follicular</MenuItem>
              <MenuItem value='ovulation'>Ovulation</MenuItem>
              <MenuItem value='luteal'>Luteal</MenuItem>
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
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
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

