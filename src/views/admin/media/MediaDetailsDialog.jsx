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

const MediaDetailsDialog = ({ open, onClose, media: initialMedia }) => {
  const [media, setMedia] = useState(null)
  const [usageCount, setUsageCount] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && initialMedia?._id) {
      setMedia(initialMedia)
      setLoading(true)
      adminAPI
        .getMediaById(initialMedia._id)
        .then((res) => {
          const data = res?.data
          if (data?.media) setMedia(data.media)
          if (data?.usageCount !== undefined) setUsageCount(data.usageCount)
        })
        .catch(() => {
          toast.error('Could not load full details')
        })
        .finally(() => setLoading(false))
    } else {
      setMedia(initialMedia || null)
      setUsageCount(null)
    }
  }, [open, initialMedia])

  const copyToClipboard = (text, label = 'URL') => {
    if (!text) return
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error('Failed to copy')
    )
  }

  if (!media) return null

  const videoUrl = media.filePath || media.videoUrl || ''
  const thumbnailUrl = media.thumbnail || ''
  const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : (typeof window !== 'undefined' ? window.location.origin : '') + videoUrl
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
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth scroll='paper'>
      <DialogTitle className='flex items-center justify-between gap-2'>
        <span className='flex items-center gap-2'>
          <i className='ri-eye-line text-xl' />
          Media Details
        </span>
        <IconButton size='small' onClick={onClose} aria-label='close'>
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
            <DetailRow label='Title' value={media.title} />
            <DetailRow label='Description' value={media.description} />
            <Grid size={{ xs: 12 }}>
              <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                Type
              </Typography>
              <Chip label={media.mediaType || '—'} size='small' variant='outlined' />
            </Grid>
            <DetailRow label='Duration' value={media.duration != null ? formatDurationSeconds(media.duration) : '—'} />
            <DetailRow label='Orientation' value={media.orientation} />
            <DetailRow label='Status' value={media.isActive ? 'Active' : 'Inactive'} type='text' />
            {usageCount !== null && (
              <DetailRow label='Used in steps' value={String(usageCount)} />
            )}

            {media.tags?.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                  Tags
                </Typography>
                <div className='flex gap-1 flex-wrap'>
                  {media.tags.map((tag, idx) => (
                    <Chip key={idx} label={tag} size='small' variant='outlined' />
                  ))}
                </div>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                Video URL
              </Typography>
              <TextField
                fullWidth
                size='small'
                value={videoUrl || '—'}
                readOnly
                variant='outlined'
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => copyToClipboard(fullVideoUrl || videoUrl, 'Video URL')}
                          disabled={!videoUrl}
                          aria-label='Copy video URL'
                        >
                          <i className='ri-file-copy-line' />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              {videoUrl && (
                <Button
                  size='small'
                  href={fullVideoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mts-2'
                  startIcon={<i className='ri-external-link-line' />}
                >
                  Open video
                </Button>
              )}
            </Grid>

            {thumbnailUrl && (
              <Grid size={{ xs: 12 }}>
                <Typography variant='caption' color='text.secondary' display='block' className='mbe-1'>
                  Thumbnail URL
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  value={thumbnailUrl}
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
                          >
                            <i className='ri-file-copy-line' />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
            )}

            {media.createdAt && (
              <DetailRow label='Created' value={media.createdAt} type='date' />
            )}
            {media.updatedAt && (
              <DetailRow label='Updated' value={media.updatedAt} type='date' />
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default MediaDetailsDialog
