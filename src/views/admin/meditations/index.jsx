'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import MeditationListTable from './MeditationListTable'
import AddMeditationDialog from './AddMeditationDialog'
import EditMeditationDialog from './EditMeditationDialog'
import ViewMeditationDialog from './ViewMeditationDialog'

const MeditationList = ({ meditationData, onRefresh }) => {
    const [addMeditationOpen, setAddMeditationOpen] = useState(false)
    const [editMeditationOpen, setEditMeditationOpen] = useState(false)
    const [viewMeditationOpen, setViewMeditationOpen] = useState(false)
    const [selectedMeditation, setSelectedMeditation] = useState(null)

    return (
        <>
            <MeditationListTable
                meditationData={meditationData}
                setAddMeditationOpen={setAddMeditationOpen}
                setEditMeditationOpen={setEditMeditationOpen}
                setViewMeditationOpen={setViewMeditationOpen}
                setSelectedMeditation={setSelectedMeditation}
                onRefresh={onRefresh}
            />
            <AddMeditationDialog
                open={addMeditationOpen}
                handleClose={() => setAddMeditationOpen(false)}
                onRefresh={onRefresh}
            />
            <EditMeditationDialog
                open={editMeditationOpen}
                handleClose={() => {
                    setEditMeditationOpen(false)
                    setSelectedMeditation(null)
                }}
                meditation={selectedMeditation}
                onRefresh={onRefresh}
            />
            {viewMeditationOpen && (
                <ViewMeditationDialog
                    open={viewMeditationOpen}
                    handleClose={() => {
                        setViewMeditationOpen(false)
                        setSelectedMeditation(null)
                    }}
                    meditation={selectedMeditation}
                />
            )}
        </>
    )
}

export default MeditationList
