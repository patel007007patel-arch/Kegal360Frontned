'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

// Components Imports
import MeditationList from '@views/admin/meditations'
import { adminAPI } from '@/utils/api'

const AdminMeditations = () => {
    const [meditations, setMeditations] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMeditations = async () => {
        try {
            setLoading(true)
            const response = await adminAPI.getMeditations()
            // admin controller returns paginated response standard format: { success: true, data: [...] }
            setMeditations(response.data || [])
        } catch (error) {
            toast.error(error.message || 'Error fetching meditations')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeditations()
    }, [])

    if (loading) {
        return (
            <Grid container spacing={6}>
                <Grid size={{ xs: 12 }}>
                    <div className='flex items-center justify-center p-8'>
                        <Typography>Loading meditations...</Typography>
                    </div>
                </Grid>
            </Grid>
        )
    }

    return <MeditationList meditationData={meditations} onRefresh={fetchMeditations} />
}

export default AdminMeditations
