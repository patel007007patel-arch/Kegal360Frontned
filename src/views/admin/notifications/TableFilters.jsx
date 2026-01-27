// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

const TableFilters = ({ filters, setFilters }) => {
  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='type-select'>Notification Type</InputLabel>
            <Select
              fullWidth
              id='select-type'
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              label='Notification Type'
              labelId='type-select'
            >
              <MenuItem value=''>All Types</MenuItem>
              <MenuItem value='period_reminder'>Period Reminder</MenuItem>
              <MenuItem value='ovulation_reminder'>Ovulation Reminder</MenuItem>
              <MenuItem value='log_reminder'>Log Reminder</MenuItem>
              <MenuItem value='yoga_reminder'>Yoga Reminder</MenuItem>
              <MenuItem value='meditation_reminder'>Meditation Reminder</MenuItem>
              <MenuItem value='subscription'>Subscription</MenuItem>
              <MenuItem value='general'>General</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              value={filters.isRead}
              onChange={e => setFilters({ ...filters, isRead: e.target.value })}
              label='Status'
              labelId='status-select'
            >
              <MenuItem value=''>All Status</MenuItem>
              <MenuItem value='false'>Unread</MenuItem>
              <MenuItem value='true'>Read</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label='Search User'
            value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })}
            placeholder='Search by user name or email'
            size='small'
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

