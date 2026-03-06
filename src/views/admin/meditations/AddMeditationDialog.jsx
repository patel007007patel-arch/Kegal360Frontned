'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Autocomplete from '@mui/material/Autocomplete'

// Third-party Imports
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'

// Utils
import { adminAPI } from '@/utils/api'

const AddMeditationDialog = ({ open, handleClose, onRefresh }) => {
    const [loading, setLoading] = useState(false)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [mediaLoading, setMediaLoading] = useState(false)
    const [media, setMedia] = useState([])
    const [uploadingAudio, setUploadingAudio] = useState(false)
    const [showAudioUpload, setShowAudioUpload] = useState(false)
    const [audioFile, setAudioFile] = useState(null)
    const [audioTitle, setAudioTitle] = useState('')

    const audios = Array.isArray(media) ? media.filter(m => (m.mediaType || '').toLowerCase() === 'audio') : []

    const {
        control,
        reset: resetForm,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            subtitle: '',
            description: '',
            duration: 0,
            benefits: [{ value: '' }],
            audio: '',
            isActive: true
        }
    })

    const meditationTitle = watch('title')

    useEffect(() => {
        if (open) {
            loadMedia()
            setShowAudioUpload(false)
            setAudioFile(null)
            setAudioTitle('')
        }
    }, [open])

    const loadMedia = async () => {
        setMediaLoading(true)
        try {
            const res = await adminAPI.getMedia()
            const list = res?.data?.media
            setMedia(Array.isArray(list) ? list : [])
        } catch {
            setMedia([])
        } finally {
            setMediaLoading(false)
        }
    }

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'benefits'
    })

    const onSubmit = async (data) => {
        try {
            if (!data.audio) {
                toast.error('Please select an audio file from the library')
                return
            }

            setLoading(true)
            const formData = new FormData()

            formData.append('mediaId', data.audio)
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile)
            }

            formData.append('title', data.title)
            formData.append('subtitle', data.subtitle || '')
            formData.append('description', data.description || '')
            formData.append('duration', data.duration || 0)
            formData.append('isActive', data.isActive ? 'true' : 'false')

            // Map benefits array of objects [{value: "abc"}, ...] to array of strings ["abc", ...]
            const validBenefits = data.benefits
                ?.map((item) => item.value?.trim())
                .filter((val) => val) // remove empty strings

            if (validBenefits && validBenefits.length > 0) {
                formData.append('benefits', JSON.stringify(validBenefits))
            }

            await adminAPI.createMeditation(formData)
            toast.success('Meditation created successfully')
            handleClose()
            setThumbnailFile(null)
            setAudioFile(null)
            setShowAudioUpload(false)
            resetForm()
            if (onRefresh) onRefresh()
        } catch (error) {
            toast.error(error.message || 'Error creating meditation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            maxWidth='md'
            scroll='body'
            onClose={handleClose}
        >
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                Add New Meditation
                <Typography component='span' className='flex flex-col text-center'>
                    Add a new meditation audio to the library
                </Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent className='pbs-6 sm:pbe-6 sm:pli-16' sx={{ overflow: 'visible' }}>
                    <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
                        <i className='ri-close-line text-textSecondary' />
                    </IconButton>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='title'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Title'
                                        placeholder='Morning Calm'
                                        {...(errors.title && { error: true, helperText: 'This field is required.' })}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='subtitle'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label='Subtitle'
                                        placeholder='Start your day with peace'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='description'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label='Description'
                                        placeholder='Description of the meditation'
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name='audio'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <>
                                        <Autocomplete
                                            fullWidth
                                            options={audios}
                                            getOptionLabel={(option) => (option && option.title) || ''}
                                            value={audios.find(a => a._id === field.value) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue ? newValue._id : '')
                                            }}
                                            loading={mediaLoading}
                                            noOptionsText={mediaLoading ? 'Loading audio...' : 'No audio found. Upload one below.'}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label='Audio'
                                                    placeholder='Search or select audio'
                                                    error={Boolean(errors.audio)}
                                                    helperText={errors.audio ? 'This field is required.' : undefined}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant='outlined'
                                            size='small'
                                            startIcon={<i className='ri-upload-line' />}
                                            onClick={() => setShowAudioUpload(!showAudioUpload)}
                                            sx={{ mt: 2 }}
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
                                                        placeholder={meditationTitle || 'Enter audio title'}
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
                                                                fd.append('title', audioTitle || meditationTitle || 'New Audio')
                                                                fd.append('mediaType', 'audio')
                                                                fd.append('orientation', 'portrait')
                                                                fd.append('isActive', 'true')
                                                                const response = await adminAPI.createMedia(fd)
                                                                const newAudio = response.data?.media
                                                                if (newAudio) {
                                                                    await loadMedia()
                                                                    setValue('audio', newAudio._id)
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
                                    </>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                type='file'
                                label='Thumbnail (Optional)'
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => setThumbnailFile(e.target.files[0])}
                                inputProps={{ accept: 'image/*' }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant='subtitle2' className='mbe-3'>
                                Benefits
                            </Typography>
                            {fields.map((item, index) => (
                                <Box key={item.id} className='flex items-center gap-2 mbe-3'>
                                    <Controller
                                        name={`benefits.${index}.value`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                size='small'
                                                placeholder='Enter a benefit'
                                            />
                                        )}
                                    />
                                    <IconButton onClick={() => remove(index)} color='error' size='small'>
                                        <i className='ri-delete-bin-7-line' />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant='outlined'
                                size='small'
                                startIcon={<i className='ri-add-line' />}
                                onClick={() => append({ value: '' })}
                            >
                                Add Benefit
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='duration'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='number'
                                        label='Duration (seconds)'
                                        placeholder='600'
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name='isActive'
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={field.onChange} />}
                                        label='Active'
                                        className='mt-4'
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button variant='contained' type='submit' disabled={loading}>
                        {loading ? 'Creating...' : 'Submit'}
                    </Button>
                    <Button variant='outlined' color='secondary' type='reset' onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AddMeditationDialog
