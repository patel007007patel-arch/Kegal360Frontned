'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import SequenceListTable from './SequenceListTable'
import AddSequenceDialog from './AddSequenceDialog'
import EditSequenceDialog from './EditSequenceDialog'

const SequenceList = ({ sequenceData, cyclePhases = [], onRefresh }) => {
  const [addSequenceOpen, setAddSequenceOpen] = useState(false)
  const [editSequenceOpen, setEditSequenceOpen] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState(null)
  const [initialCyclePhaseId, setInitialCyclePhaseId] = useState(null)

  const handleCloseAdd = () => {
    setAddSequenceOpen(false)
    setInitialCyclePhaseId(null)
  }

  return (
    <>
      <SequenceListTable
        sequenceData={sequenceData}
        cyclePhases={cyclePhases}
        setAddSequenceOpen={setAddSequenceOpen}
        setInitialCyclePhaseId={setInitialCyclePhaseId}
        setEditSequenceOpen={setEditSequenceOpen}
        setSelectedSequence={setSelectedSequence}
        onRefresh={onRefresh}
      />
      <AddSequenceDialog
        open={addSequenceOpen}
        handleClose={handleCloseAdd}
        onRefresh={onRefresh}
        initialCyclePhaseId={initialCyclePhaseId}
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
