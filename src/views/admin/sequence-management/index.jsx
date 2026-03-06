'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import SequenceList from '@views/admin/sequences'
import SessionList from '@views/admin/sessions'
import StepList from '@views/admin/steps'
import { adminAPI } from '@/utils/api'

const SequenceManagement = () => {
    const [activeTab, setActiveTab] = useState('sequences')
    const [loading, setLoading] = useState(true)

    // Data states
    const [sequences, setSequences] = useState([])
    const [cyclePhases, setCyclePhases] = useState([])
    const [sessions, setSessions] = useState([])
    const [steps, setSteps] = useState([])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [seqRes, phaseRes, sessRes, stepsRes] = await Promise.all([
                adminAPI.getSequences(),
                adminAPI.getCyclePhases(),
                adminAPI.getSessions(),
                adminAPI.getSteps()
            ])

            setSequences(seqRes.data.sequences || [])
            setCyclePhases(phaseRes.data.cyclePhases || [])
            setSessions(sessRes.data.sessions || [])
            setSteps(stepsRes.data.steps || [])
        } catch (error) {
            toast.error(error.message || 'Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    if (loading) {
        return (
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <div className='flex items-center justify-center p-8'>
                        <Typography>Loading data...</Typography>
                    </div>
                </Grid>
            </Grid>
        )
    }

    return (
        <Card>
            <TabContext value={activeTab}>
                <TabList
                    onChange={handleTabChange}
                    className='border-be'
                    sx={{
                        '& .MuiTab-root': {
                            padding: '16px 32px',
                            fontSize: '1.05rem',
                            textTransform: 'none', // Prevents all-caps which can look squished
                            fontWeight: 500,
                            '@media (max-width: 600px)': {
                                padding: '12px 16px',
                                fontSize: '0.9rem',
                            }
                        }
                    }}
                >
                    <Tab value='sequences' label='Sequences' />
                    <Tab value='sessions' label='Sessions' />
                    <Tab value='steps' label='Steps' />
                </TabList>
                <CardContent>
                    <TabPanel value='sequences' className='p-0'>
                        <SequenceList
                            sequenceData={sequences}
                            cyclePhases={cyclePhases}
                            onRefresh={fetchData}
                        />
                    </TabPanel>
                    <TabPanel value='sessions' className='p-0'>
                        <SessionList
                            sessionData={sessions}
                            sequences={sequences}
                            onRefresh={fetchData}
                        />
                    </TabPanel>
                    <TabPanel value='steps' className='p-0'>
                        <StepList
                            stepData={steps}
                            sessions={sessions}
                            onRefresh={fetchData}
                        />
                    </TabPanel>
                </CardContent>
            </TabContext>
        </Card>
    )
}

export default SequenceManagement
