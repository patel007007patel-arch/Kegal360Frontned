'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Autocomplete from '@mui/material/Autocomplete'
import { toast } from 'react-toastify'

// Components Imports
import { adminAPI } from '@/utils/api'

const EditMeditationDialog = ({ open, handleClose, meditation, onRefresh }) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        duration: 0,
        benefits: [{ value: '' }],
        isActive: true
    })
    const [loading, setLoading] = useState(false)
    const [mediaLoading, setMediaLoading] = useState(false)
    const [mediaList, setMediaList] = useState([])
    const [newThumbnailFile, setNewThumbnailFile] = useState(null)
    const [uploadingAudio, setUploadingAudio] = useState(false)
    const [showAudioUpload, setShowAudioUpload] = useState(false)
    const [audioFile, setAudioFile] = useState(null)
    const [audioTitle, setAudioTitle] = useState('')
    const [selectedAudioId, setSelectedAudioId] = useState('')

    const audios = Array.isArray(mediaList) ? mediaList.filter(m => (m.mediaType || '').toLowerCase() === 'audio') : []

    const loadMedia = async () => {
        setMediaLoading(true)
        try {
            const res = await adminAPI.getMedia()
            const list = res?.data?.media
            setMediaList(Array.isArray(list) ? list : [])
        } catch {
            setMediaList([])
        } finally {
            setMediaLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            loadMedia()
        }
    }, [open])

    useEffect(() => {
        if (meditation) {
            setFormData({
                title: meditation.title || '',
                subtitle: meditation.subtitle || '',
                description: meditation.description || '',
                duration: meditation.duration || 0,
                benefits: meditation.benefits && meditation.benefits.length > 0
                    ? meditation.benefits.map((b) => ({ value: b }))
                    : [{ value: '' }],
                isActive: meditation.isActive !== undefined ? meditation.isActive : true
            })
            setNewThumbnailFile(null)
            setSelectedAudioId(meditation.media?._id || meditation.media || '')
            setShowAudioUpload(false)
            setAudioFile(null)
            setAudioTitle('')
        }
    }, [meditation])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const fd = new FormData()

            // Metadata
            fd.append('title', formData.title || '')
            fd.append('subtitle', formData.subtitle || '')
            fd.append('description', formData.description || '')
            fd.append('duration', String(parseInt(formData.duration) || 0))
            fd.append('isActive', formData.isActive ? 'true' : 'false')

            const validBenefits = formData.benefits
                .map((item) => item.value?.trim())
                .filter((val) => val)

            if (validBenefits.length > 0) {
                fd.append('benefits', JSON.stringify(validBenefits))
            }

            // Files (backend expects main file field name to be 'video' for uploadMediaAndThumbnail middleware if no mediaId)
            // But we send mediaId if an audio from the library is selected
            if (selectedAudioId && selectedAudioId !== (meditation?.media?._id || meditation?.media)) {
                fd.append('mediaId', selectedAudioId)
            }

            if (newThumbnailFile) fd.append('thumbnail', newThumbnailFile)

            await adminAPI.updateMeditation(meditation._id, fd)
            toast.success('Meditation updated successfully')
            onRefresh()
            handleClose()
        } catch (error) {
            toast.error(error.message || 'Error updating meditation')
        } finally {
            setLoading(false)
        }
    }

    const handleAddBenefit = () => {
        setFormData({ ...formData, benefits: [...formData.benefits, { value: '' }] })
    }

    const handleRemoveBenefit = (index) => {
        const newBenefits = [...formData.benefits]
        newBenefits.splice(index, 1)
        setFormData({ ...formData, benefits: newBenefits })
    }

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits]
        newBenefits[index].value = value
        setFormData({ ...formData, benefits: newBenefits })
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth scroll='body'>
            <form onSubmit={handleSubmit}>
                <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                    Edit Meditation
                </DialogTitle>
                <DialogContent sx={{ overflow: 'visible' }} className='pbs-6 sm:pbe-6 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label='Title'
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label='Subtitle'
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label='Description'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                type='number'
                                label='Duration (seconds)'
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant='subtitle2' className='mbe-3'>
                                Benefits
                            </Typography>
                            {formData.benefits.map((item, index) => (
                                <Box key={index} className='flex items-center gap-2 mbe-3'>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        value={item.value}
                                        placeholder='Enter a benefit'
                                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                                    />
                                    <IconButton onClick={() => handleRemoveBenefit(index)} color='error' size='small'>
                                        <i className='ri-delete-bin-7-line' />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant='outlined'
                                size='small'
                                startIcon={<i className='ri-add-line' />}
                                onClick={handleAddBenefit}
                            >
                                Add Benefit
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box className='flex flex-col gap-2'>
                                <Typography variant='body2' color='text.primary'>
                                    Replace Audio (from Media Library)
                                </Typography>
                                <Autocomplete
                                    fullWidth
                                    options={audios}
                                    getOptionLabel={(option) => (option && option.title) || ''}
                                    value={audios.find(a => a._id === selectedAudioId) || null}
                                    onChange={(_, newValue) => {
                                        setSelectedAudioId(newValue ? newValue._id : '')
                                    }}
                                    loading={mediaLoading}
                                    noOptionsText={mediaLoading ? 'Loading audio...' : 'No audio found. Upload one below.'}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label='Audio'
                                            placeholder='Search or select audio'
                                        />
                                    )}
                                />
                                <Button
                                    variant='outlined'
                                    size='small'
                                    startIcon={<i className='ri-upload-line' />}
                                    onClick={() => setShowAudioUpload(!showAudioUpload)}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    {showAudioUpload ? 'Cancel Upload' : 'Upload New Audio'}
                                </Button>
                                {showAudioUpload && (
                                    <Grid
                                        container
                                        spacing={2}
                                        sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                                    >
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant='subtitle2' gutterBottom>
                                                Upload New Audio
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label='Audio Title'
                                                value={audioTitle}
                                                onChange={(e) => setAudioTitle(e.target.value)}
                                                placeholder={formData.title || 'Enter audio title'}
                                                helperText='Leave empty to use meditation title'
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                type='file'
                                                label='Audio File'
                                                InputLabelProps={{ shrink: true }}
                                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                                inputProps={{ accept: 'audio/*' }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                variant='contained'
                                                onClick={async () => {
                                                    if (!audioFile) {
                                                        toast.error('Please select an audio file')
                                                        return
                                                    }
                                                    try {
                                                        setUploadingAudio(true)
                                                        const fd = new FormData()
                                                        fd.append('video', audioFile)
                                                        fd.append('title', audioTitle || formData.title || 'New Audio')
                                                        fd.append('mediaType', 'audio')
                                                        fd.append('orientation', 'portrait')
                                                        fd.append('isActive', 'true')
                                                        const response = await adminAPI.createMedia(fd)
                                                        const newAudio = response.data?.media
                                                        if (newAudio) {
                                                            await loadMedia()
                                                            setSelectedAudioId(newAudio._id)
                                                            toast.success('Audio uploaded and selected successfully')
                                                            setShowAudioUpload(false)
                                                            setAudioFile(null)
                                                            setAudioTitle('')
                                                        }
                                                    } catch (error) {
                                                        toast.error(error.message || 'Error uploading audio')
                                                    } finally {
                                                        setUploadingAudio(false)
                                                    }
                                                }}
                                                disabled={!audioFile || uploadingAudio}
                                                startIcon={
                                                    uploadingAudio ? (
                                                        <i className='ri-loader-4-line animate-spin' />
                                                    ) : (
                                                        <i className='ri-upload-line' />
                                                    )
                                                }
                                            >
                                                {uploadingAudio ? 'Uploading...' : 'Upload Audio'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}
                                {selectedAudioId && selectedAudioId !== (meditation?.media?._id || meditation?.media) && (
                                    <Typography variant='caption' color='text.secondary'>
                                        New audio selected. Save changes to apply.
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Box className='flex flex-col gap-2'>
                                <Typography variant='body2' color='text.primary'>
                                    Replace Thumbnail (optional)
                                </Typography>
                                <Button
                                    variant='outlined'
                                    component='label'
                                    size='small'
                                    startIcon={<i className='ri-image-line' />}
                                >
                                    {newThumbnailFile ? newThumbnailFile.name : 'Choose thumbnail'}
                                    <input
                                        type='file'
                                        hidden
                                        accept='image/*'
                                        onChange={(e) => setNewThumbnailFile(e.target.files?.[0] || null)}
                                    />
                                </Button>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label='Active'
                                className='mt-4'
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button variant='contained' color='primary' type='submit' disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default EditMeditationDialog
