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
  const [phase, setPhase] = useState('')
  const [flow, setFlow] = useState('')
  const [mood, setMood] = useState('')

  useEffect(() => {
    const filteredData = tableData?.filter(log => {
      if (phase && log.phase !== phase) return false
      if (flow && log.flow !== flow) return false
      if (mood && (!log.mood || !log.mood.includes(mood))) return false

      return true
    })

    setData(filteredData || [])
  }, [phase, flow, mood, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={5}>
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
              <MenuItem value='period'>Period</MenuItem>
              <MenuItem value='follicular'>Follicular</MenuItem>
              <MenuItem value='ovulation'>Ovulation</MenuItem>
              <MenuItem value='luteal'>Luteal</MenuItem>
              <MenuItem value='missed'>Missed</MenuItem>
              <MenuItem value='late'>Late</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='flow-select'>Select Flow</InputLabel>
            <Select
              fullWidth
              id='select-flow'
              value={flow}
              onChange={e => setFlow(e.target.value)}
              label='Select Flow'
              labelId='flow-select'
              inputProps={{ placeholder: 'Select Flow' }}
            >
              <MenuItem value=''>Select Flow</MenuItem>
              <MenuItem value='light'>Light</MenuItem>
              <MenuItem value='medium'>Medium</MenuItem>
              <MenuItem value='heavy'>Heavy</MenuItem>
              <MenuItem value='spotting'>Spotting</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel id='mood-select'>Select Mood</InputLabel>
            <Select
              fullWidth
              id='select-mood'
              label='Select Mood'
              value={mood}
              onChange={e => setMood(e.target.value)}
              labelId='mood-select'
              inputProps={{ placeholder: 'Select Mood' }}
            >
              <MenuItem value=''>Select Mood</MenuItem>
              <MenuItem value='happy'>Happy</MenuItem>
              <MenuItem value='energetic'>Energetic</MenuItem>
              <MenuItem value='calm'>Calm</MenuItem>
              <MenuItem value='sleepy'>Sleepy</MenuItem>
              <MenuItem value='anxious'>Anxious</MenuItem>
              <MenuItem value='sad'>Sad</MenuItem>
              <MenuItem value='angry'>Angry</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

