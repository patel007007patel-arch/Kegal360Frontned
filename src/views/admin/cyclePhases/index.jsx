'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import CyclePhaseListTable from './CyclePhaseListTable'
import AddCyclePhaseDialog from './AddCyclePhaseDialog'
import EditCyclePhaseDialog from './EditCyclePhaseDialog'

const CyclePhaseList = ({ cyclePhaseData, onRefresh }) => {
  // States
  const [addCyclePhaseOpen, setAddCyclePhaseOpen] = useState(false)
  const [editCyclePhaseOpen, setEditCyclePhaseOpen] = useState(false)
  const [selectedCyclePhase, setSelectedCyclePhase] = useState(null)

  return (
    <>
      <CyclePhaseListTable
        cyclePhaseData={cyclePhaseData}
        setAddCyclePhaseOpen={setAddCyclePhaseOpen}
        setEditCyclePhaseOpen={setEditCyclePhaseOpen}
        setSelectedCyclePhase={setSelectedCyclePhase}
        onRefresh={onRefresh}
      />
      <AddCyclePhaseDialog
        open={addCyclePhaseOpen}
        handleClose={() => setAddCyclePhaseOpen(false)}
        onRefresh={onRefresh}
      />
      <EditCyclePhaseDialog
        open={editCyclePhaseOpen}
        handleClose={() => {
          setEditCyclePhaseOpen(false)
          setSelectedCyclePhase(null)
        }}
        cyclePhase={selectedCyclePhase}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default CyclePhaseList
