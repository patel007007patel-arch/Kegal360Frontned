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
  const [plan, setPlan] = useState('')
  const [status, setStatus] = useState('')
  const [trial, setTrial] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(sub => {
      if (plan && sub.plan !== plan) return false
      if (status) {
        const subStatus = sub.isActive ? 'active' : 'inactive'
        if (subStatus !== status) return false
      }
      if (trial !== '') {
        const isTrial = sub.isTrial ? 'true' : 'false'
        if (isTrial !== trial) return false
      }

      return true
    })

    setData(filteredData || [])
  }, [plan, status, trial, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='plan-select'>Select Plan</InputLabel>
            <Select
              fullWidth
              id='select-plan'
              value={plan}
              onChange={e => setPlan(e.target.value)}
              label='Select Plan'
              labelId='plan-select'
              inputProps={{ placeholder: 'Select Plan' }}
            >
              <MenuItem value=''>Select Plan</MenuItem>
              <MenuItem value='free'>Free</MenuItem>
              <MenuItem value='monthly'>Monthly</MenuItem>
              <MenuItem value='yearly'>Yearly</MenuItem>
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
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='trial-select'>Trial</InputLabel>
            <Select
              fullWidth
              id='select-trial'
              label='Trial'
              value={trial}
              onChange={e => setTrial(e.target.value)}
              labelId='trial-select'
              inputProps={{ placeholder: 'Trial' }}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='true'>Trial</MenuItem>
              <MenuItem value='false'>Paid</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

