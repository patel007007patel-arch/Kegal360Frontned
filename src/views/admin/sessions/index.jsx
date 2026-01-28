'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import SessionListTable from './SessionListTable'
import AddSessionDialog from './AddSessionDialog'
import EditSessionDialog from './EditSessionDialog'

const SessionList = ({ sessionData, onRefresh }) => {
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [editSessionOpen, setEditSessionOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  return (
    <>
      <SessionListTable
        sessionData={sessionData}
        setAddSessionOpen={setAddSessionOpen}
        setEditSessionOpen={setEditSessionOpen}
        setSelectedSession={setSelectedSession}
        onRefresh={onRefresh}
      />
      <AddSessionDialog
        open={addSessionOpen}
        handleClose={() => setAddSessionOpen(false)}
        onRefresh={onRefresh}
      />
      <EditSessionDialog
        open={editSessionOpen}
        handleClose={() => {
          setEditSessionOpen(false)
          setSelectedSession(null)
        }}
        session={selectedSession}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default SessionList
