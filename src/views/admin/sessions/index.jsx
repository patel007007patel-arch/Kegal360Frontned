'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import SessionListTable from './SessionListTable'
import AddSessionDialog from './AddSessionDialog'
import EditSessionDialog from './EditSessionDialog'

const SessionList = ({ sessionData, sequences = [], onRefresh }) => {
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [editSessionOpen, setEditSessionOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [initialSequenceId, setInitialSequenceId] = useState(null)

  const handleCloseAdd = () => {
    setAddSessionOpen(false)
    setInitialSequenceId(null)
  }

  return (
    <>
      <SessionListTable
        sessionData={sessionData}
        sequences={sequences}
        setAddSessionOpen={setAddSessionOpen}
        setInitialSequenceId={setInitialSequenceId}
        setEditSessionOpen={setEditSessionOpen}
        setSelectedSession={setSelectedSession}
        onRefresh={onRefresh}
      />
      <AddSessionDialog
        open={addSessionOpen}
        handleClose={handleCloseAdd}
        onRefresh={onRefresh}
        initialSequenceId={initialSequenceId}
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
