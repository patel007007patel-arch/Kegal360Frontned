'use client'

// React Imports
import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@components/admin/ConfirmationDialog'
import TableFilters from './TableFilters'
import { toast } from 'react-toastify'
import { adminAPI } from '@/utils/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const DEFAULT_ROWS_PER_PAGE = 10

// Group sequences by cycle phase (phase order from cyclePhases)
function groupSequencesByPhase(sequences, cyclePhases) {
  const byPhase = {}
  const phaseList = Array.isArray(cyclePhases) ? [...cyclePhases].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
  phaseList.forEach(phase => {
    byPhase[phase._id] = { phase, sequences: [] }
  })
  ;(sequences || []).forEach(seq => {
    const phaseId = seq.cyclePhase?._id || seq.cyclePhase
    if (phaseId && byPhase[phaseId]) {
      byPhase[phaseId].sequences.push(seq)
    }
  })
  return phaseList.map(p => ({ phase: p, sequences: byPhase[p._id]?.sequences || [] }))
}

const SequenceListTable = ({
  sequenceData,
  cyclePhases = [],
  setAddSequenceOpen,
  setInitialCyclePhaseId,
  setEditSequenceOpen,
  setSelectedSequence,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sequenceToDelete, setSequenceToDelete] = useState(null)
  const [expandedPhase, setExpandedPhase] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sectionPages, setSectionPages] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  useEffect(() => {
    setFilteredData(sequenceData || [])
  }, [sequenceData])

  const handleDeleteClick = sequence => {
    setSequenceToDelete(sequence)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteSequence(sequenceToDelete._id)
      toast.success('Sequence deleted successfully')
      setDeleteDialogOpen(false)
      setSequenceToDelete(null)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting sequence')
    }
  }

  const handleDuplicate = async sequence => {
    try {
      await adminAPI.duplicateSequence(sequence._id)
      toast.success('Sequence duplicated successfully')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error duplicating sequence')
    }
  }

  const filteredBySearch = useMemo(() => {
    const list = filteredData || []
    if (!globalFilter.trim()) return list
    const q = globalFilter.toLowerCase().trim()
    return list.filter(
      item =>
        (item.displayName || '').toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q)
    )
  }, [filteredData, globalFilter])

  const grouped = useMemo(
    () => groupSequencesByPhase(filteredBySearch, cyclePhases),
    [filteredBySearch, cyclePhases]
  )

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor('displayName', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography color='text.primary'>{row.original.displayName || row.original.name}</Typography>
        )
      }),
      columnHelper.accessor('order', {
        header: 'Order',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.order}</Typography>
      }),
      columnHelper.accessor('totalDuration', {
        header: 'Duration',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {Math.floor((row.original.totalDuration || 0) / 60)} min
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isActive ? 'Active' : 'Inactive'}
            size='small'
            color={row.original.isActive ? 'success' : 'default'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => handleDuplicate(row.original)} title='Duplicate'>
              <i className='ri-file-copy-line text-textSecondary' />
            </IconButton>
            <IconButton size='small' onClick={() => handleDeleteClick(row.original)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedSequence(row.original)
                      setEditSequenceOpen(true)
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [setEditSequenceOpen, setSelectedSequence]
  )

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={sequenceData || []} />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <TextField
            size='small'
            placeholder='Search sequence...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className='max-sm:is-full sm:min-is-[200px]'
          />
          <Button variant='contained' onClick={() => setAddSequenceOpen(true)} className='max-sm:is-full'>
            Add New Sequence
          </Button>
        </div>
        <Divider />
        {grouped.length === 0 ? (
          <Box className='p-8 text-center'>
            <Typography color='text.secondary'>No cycle phases yet. Add phases first in Cycle Phases.</Typography>
          </Box>
        ) : (
          grouped.map(({ phase, sequences }) => {
            const phaseId = phase._id
            const isExpanded = expandedPhase === phaseId
            const page = sectionPages[phaseId] ?? 0
            const paginatedSequences = sequences.slice(
              page * rowsPerPage,
              (page + 1) * rowsPerPage
            )
            return (
              <Accordion
                key={phaseId}
                expanded={isExpanded}
                onChange={() => setExpandedPhase(prev => (prev === phaseId ? null : phaseId))}
                sx={{ boxShadow: 'none', '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line text-xl' />}>
                  <div className='flex items-center gap-3'>
                    <i className='ri-folder-3-line text-2xl text-primary' />
                    <Typography variant='subtitle1' fontWeight={600}>
                      {phase.displayName || phase.name}
                    </Typography>
                    <Chip size='small' label={`${sequences.length} sequence${sequences.length !== 1 ? 's' : ''}`} variant='outlined' />
                    <Button
                      size='small'
                      variant='text'
                      onClick={e => {
                        e.stopPropagation()
                        setInitialCyclePhaseId(phaseId)
                        setAddSequenceOpen(true)
                      }}
                    >
                      {sequences.length === 0 ? 'Add first sequence' : 'Add sequence'}
                    </Button>
                  </div>
                </AccordionSummary>
                <AccordionDetails className='p-0'>
                  {sequences.length === 0 ? (
                    <Box className='p-6 text-center bg-actionHover'>
                      <Typography color='text.secondary' className='mbe-2'>
                        No sequences in this phase yet.
                      </Typography>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                          setInitialCyclePhaseId(phaseId)
                          setAddSequenceOpen(true)
                        }}
                      >
                        Add first sequence
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <div className='overflow-x-auto'>
                        <table className={tableStyles.table}>
                          <thead>
                            <tr>
                              {columns.map(col => (
                                <th key={col.id}>
                                  {typeof col.header === 'function' ? col.header({}) : col.header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedSequences.map(seq => (
                              <tr key={seq._id}>
                                {columns.map(col => (
                                  <td key={col.id}>
                                    {col.cell
                                      ? col.cell({
                                          row: { original: seq, id: seq._id },
                                          getValue: () => seq[col.accessorKey || col.id]
                                        })
                                      : null}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <TablePagination
                        component='div'
                        className='border-bs'
                        count={sequences.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
                        rowsPerPageOptions={[5, 10, 25]}
                        onPageChange={(_, newPage) =>
                          setSectionPages(prev => ({ ...prev, [phaseId]: newPage }))
                        }
                        onRowsPerPageChange={e => {
                          setRowsPerPage(Number(e.target.value))
                          setSectionPages(prev => ({ ...prev, [phaseId]: 0 }))
                        }}
                      />
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </Card>
      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type='delete'
        title='Delete Sequence'
        subtitle='Are you sure? This will delete the sequence and all related sessions/steps.'
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SequenceListTable
