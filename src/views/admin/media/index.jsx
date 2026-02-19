'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import MediaListTable from './MediaListTable'
import AddMediaDialog from './AddMediaDialog'
import EditMediaDialog from './EditMediaDialog'
import MediaDetailsDialog from './MediaDetailsDialog'

const MediaList = ({ mediaData, onRefresh }) => {
  const [addMediaOpen, setAddMediaOpen] = useState(false)
  const [editMediaOpen, setEditMediaOpen] = useState(false)
  const [viewMediaOpen, setViewMediaOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)

  return (
    <>
      <MediaListTable
        mediaData={mediaData}
        setAddMediaOpen={setAddMediaOpen}
        setEditMediaOpen={setEditMediaOpen}
        setViewMediaOpen={setViewMediaOpen}
        setSelectedMedia={setSelectedMedia}
        onRefresh={onRefresh}
      />
      <AddMediaDialog
        open={addMediaOpen}
        handleClose={() => setAddMediaOpen(false)}
        onRefresh={onRefresh}
      />
      <EditMediaDialog
        open={editMediaOpen}
        handleClose={() => {
          setEditMediaOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia}
        onRefresh={onRefresh}
      />
      <MediaDetailsDialog
        open={viewMediaOpen}
        onClose={() => {
          setViewMediaOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia}
      />
    </>
  )
}

export default MediaList
