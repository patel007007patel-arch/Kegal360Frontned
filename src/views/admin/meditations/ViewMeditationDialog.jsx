'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { toast } from 'react-toastify'

// Component Imports
import { adminAPI } from '@/utils/api'
import { formatDurationSeconds } from '@/utils/string'

const ViewMeditationDialog = ({ open, handleClose, meditation: initialMeditation }) => {
    const [meditation, setMeditation] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && initialMeditation?._id) {
            setMeditation(initialMeditation)
            setLoading(true)
            adminAPI
                .getMeditationById(initialMeditation._id)
                .then((res) => {
                    const data = res?.data
                    if (data) setMeditation(data)
                })
                .catch(() => {
                    toast.error('Could not load full details')
                })
                .finally(() => setLoading(false))
        } else {
            setMeditation(initialMeditation || null)
        }
    }, [open, initialMeditation])

    const copyToClipboard = (text, label = 'URL') => {
        if (!text) return
        navigator.clipboard.writeText(text).then(
            () => toast.success(`${label} copied to clipboard`),
            () => toast.error('Failed to copy')
        )
    }

    if (!meditation) return null

    const audioUrl = (meditation.media && meditation.media.filePath) ? meditation.media.filePath : ''
    const thumbnailUrl = meditation.thumbnail || ''
    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : (typeof window !== 'undefined' && audioUrl ? window.location.origin + audioUrl : '')
    const fullThumbnailUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : (typeof window !== 'undefined' ? window.location.origin : '') + thumbnailUrl

    const DetailRow = ({ label, value, type = 'text' }) => {
        let display = value
        if (value === undefined || value === null || value === '') display = '—'
        else if (type === 'date' && value) display = new Date(value).toLocaleString()
        else if (type === 'boolean') display = value ? 'Yes' : 'No'
        return (
            <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                    {label}
                </Typography>
                <Typography variant='body2' color='text.primary'>
                    {display}
                </Typography>
            </Grid>
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth scroll='paper'>
            <DialogTitle className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-2'>
                    <i className='ri-eye-line text-xl' />
                    Meditation Details
                </span>
                <IconButton size='small' onClick={handleClose} aria-label='close'>
                    <i className='ri-close-line' />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box className='flex justify-center items-center p-6'>
                        <Typography color='text.secondary'>Loading...</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <DetailRow label='Title' value={meditation.title} />
                        <DetailRow label='Subtitle' value={meditation.subtitle} />
                        <DetailRow label='Description' value={meditation.description} />

                        <DetailRow label='Duration' value={meditation.duration != null ? formatDurationSeconds(meditation.duration) : '—'} />
                        <DetailRow label='Status' value={meditation.isActive ? 'Active' : 'Inactive'} type='text' />

                        {meditation.benefits?.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                                    Benefits
                                </Typography>
                                <div className='flex gap-1 flex-wrap'>
                                    {meditation.benefits.map((benefit, idx) => (
                                        <Chip key={idx} label={benefit} size='small' variant='outlined' />
                                    ))}
                                </div>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                                Audio URL
                            </Typography>
                            <TextField
                                fullWidth
                                size='small'
                                value={audioUrl || '—'}
                                readOnly
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => copyToClipboard(fullAudioUrl || audioUrl, 'Audio URL')}
                                                    disabled={!audioUrl}
                                                    aria-label='Copy audio URL'
                                                >
                                                    <i className='ri-file-copy-line' />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                            {audioUrl && (
                                <Button
                                    size='small'
                                    href={fullAudioUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='mts-2'
                                    startIcon={<i className='ri-external-link-line' />}
                                >
                                    Open Audio
                                </Button>
                            )}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                                Thumbnail URL
                            </Typography>
                            <TextField
                                fullWidth
                                size='small'
                                value={thumbnailUrl || '—'}
                                readOnly
                                variant='outlined'
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    size='small'
                                                    onClick={() => copyToClipboard(fullThumbnailUrl || thumbnailUrl, 'Thumbnail URL')}
                                                    aria-label='Copy thumbnail URL'
                                                    disabled={!thumbnailUrl}
                                                >
                                                    <i className='ri-file-copy-line' />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                            {thumbnailUrl && (
                                <Button
                                    size='small'
                                    href={fullThumbnailUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='mts-2'
                                    startIcon={<i className='ri-external-link-line' />}
                                >
                                    Open Thumbnail
                                </Button>
                            )}
                        </Grid>

                        {meditation.createdAt && (
                            <DetailRow label='Created' value={meditation.createdAt} type='date' />
                        )}
                        {meditation.updatedAt && (
                            <DetailRow label='Updated' value={meditation.updatedAt} type='date' />
                        )}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ViewMeditationDialog
