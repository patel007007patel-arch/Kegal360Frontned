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
  const [partnerCode, setPartnerCode] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(gift => {
      if (status) {
        // Handle expired status check
        const isExpired = gift.expiresAt && new Date(gift.expiresAt) < new Date() && gift.status === 'pending';
        const displayStatus = isExpired ? 'expired' : gift.status;
        if (displayStatus !== status) return false
      }
      if (plan && gift.plan !== plan) return false
      if (partnerCode && gift.partnerCode?.toUpperCase() !== partnerCode.toUpperCase()) return false

      return true
    })

    setData(filteredData || [])
  }, [status, plan, partnerCode, tableData, setData])

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
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
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
              <MenuItem value=''>All Plans</MenuItem>
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

