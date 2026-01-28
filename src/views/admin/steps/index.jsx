'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import StepListTable from './StepListTable'
import AddStepDialog from './AddStepDialog'
import EditStepDialog from './EditStepDialog'

const StepList = ({ stepData, onRefresh }) => {
  const [addStepOpen, setAddStepOpen] = useState(false)
  const [editStepOpen, setEditStepOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)

  return (
    <>
      <StepListTable
        stepData={stepData}
        setAddStepOpen={setAddStepOpen}
        setEditStepOpen={setEditStepOpen}
        setSelectedStep={setSelectedStep}
        onRefresh={onRefresh}
      />
      <AddStepDialog
        open={addStepOpen}
        handleClose={() => setAddStepOpen(false)}
        onRefresh={onRefresh}
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
