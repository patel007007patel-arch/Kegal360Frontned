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
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(gift => {
      if (status && gift.status !== status) return false
      if (plan && gift.plan !== plan) return false

      return true
    })

    setData(filteredData || [])
  }, [status, plan, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
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
              <MenuItem value='redeemed'>Redeemed</MenuItem>
              <MenuItem value='expired'>Expired</MenuItem>
              <MenuItem value='cancelled'>Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
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
              <MenuItem value='monthly'>Monthly</MenuItem>
              <MenuItem value='yearly'>Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

