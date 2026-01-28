'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import SequenceListTable from './SequenceListTable'
import AddSequenceDialog from './AddSequenceDialog'
import EditSequenceDialog from './EditSequenceDialog'

const SequenceList = ({ sequenceData, onRefresh }) => {
  // States
  const [addSequenceOpen, setAddSequenceOpen] = useState(false)
  const [editSequenceOpen, setEditSequenceOpen] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState(null)

  return (
    <>
      <SequenceListTable
        sequenceData={sequenceData}
        setAddSequenceOpen={setAddSequenceOpen}
        setEditSequenceOpen={setEditSequenceOpen}
        setSelectedSequence={setSelectedSequence}
        onRefresh={onRefresh}
      />
      <AddSequenceDialog
        open={addSequenceOpen}
        handleClose={() => setAddSequenceOpen(false)}
        onRefresh={onRefresh}
      />
      <EditSequenceDialog
        open={editSequenceOpen}
        handleClose={() => {
          setEditSequenceOpen(false)
          setSelectedSequence(null)
        }}
        sequence={selectedSequence}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default SequenceList
