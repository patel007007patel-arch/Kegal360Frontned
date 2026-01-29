'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import StepListTable from './StepListTable'
import AddStepDialog from './AddStepDialog'
import EditStepDialog from './EditStepDialog'

const StepList = ({ stepData, sessions = [], onRefresh }) => {
  const [addStepOpen, setAddStepOpen] = useState(false)
  const [editStepOpen, setEditStepOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)
  const [initialSessionId, setInitialSessionId] = useState(null)

  const handleCloseAdd = () => {
    setAddStepOpen(false)
    setInitialSessionId(null)
  }

  return (
    <>
      <StepListTable
        stepData={stepData}
        sessions={sessions}
        setAddStepOpen={setAddStepOpen}
        setInitialSessionId={setInitialSessionId}
        setEditStepOpen={setEditStepOpen}
        setSelectedStep={setSelectedStep}
        onRefresh={onRefresh}
      />
      <AddStepDialog
        open={addStepOpen}
        handleClose={handleCloseAdd}
        onRefresh={onRefresh}
        initialSessionId={initialSessionId}
      />
      <EditStepDialog
        open={editStepOpen}
        handleClose={() => {
          setEditStepOpen(false)
          setSelectedStep(null)
        }}
        step={selectedStep}
        onRefresh={onRefresh}
      />
    </>
  )
}

export default StepList
