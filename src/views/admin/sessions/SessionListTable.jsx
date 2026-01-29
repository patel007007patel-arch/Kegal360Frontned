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

function groupSessionsBySequence(sessions, sequences) {
  const bySeq = {}
  const seqList = Array.isArray(sequences) ? [...sequences] : []
  const seqIds = new Set(seqList.map(s => s._id))
  seqList.forEach(seq => {
    bySeq[seq._id] = { sequence: seq, sessions: [] }
  })
  ;(sessions || []).forEach(sess => {
    const seqId = sess.sequence?._id || sess.sequence
    if (seqId && bySeq[seqId]) {
      bySeq[seqId].sessions.push(sess)
    } else if (seqId && !seqIds.has(seqId)) {
      if (!bySeq[seqId]) bySeq[seqId] = { sequence: { _id: seqId, displayName: sess.sequence?.displayName || 'Unknown', name: sess.sequence?.name }, sessions: [] }
      bySeq[seqId].sessions.push(sess)
    }
  })
  return seqList.length
    ? seqList.map(seq => ({ sequence: seq, sessions: bySeq[seq._id]?.sessions || [] }))
    : Object.values(bySeq)
}

const SessionListTable = ({
  sessionData,
  sequences = [],
  setAddSessionOpen,
  setInitialSequenceId,
  setEditSessionOpen,
  setSelectedSession,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [expandedSeq, setExpandedSeq] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sectionPages, setSectionPages] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  useEffect(() => {
    setFilteredData(sessionData || [])
  }, [sessionData])

  const handleDeleteClick = session => {
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteSession(sessionToDelete._id)
      toast.success('Session deleted successfully')
      setDeleteDialogOpen(false)
      setSessionToDelete(null)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting session')
    }
  }

  const filteredBySearch = useMemo(() => {
    const list = filteredData || []
    if (!globalFilter.trim()) return list
    const q = globalFilter.toLowerCase().trim()
    return list.filter(item => (item.title || '').toLowerCase().includes(q))
  }, [filteredData, globalFilter])

  const grouped = useMemo(
    () => groupSessionsBySequence(filteredBySearch, sequences),
    [filteredBySearch, sequences]
  )

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.title}</Typography>
      }),
      columnHelper.accessor('sessionType', {
        header: 'Type',
        cell: ({ row }) => <Chip label={row.original.sessionType} size='small' variant='outlined' />
      }),
      columnHelper.accessor('duration', {
        header: 'Duration',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {Math.floor((row.original.duration || 0) / 60)} min
          </Typography>
        )
      }),
      columnHelper.accessor('difficulty', {
        header: 'Difficulty',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.difficulty}
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
                      setSelectedSession(row.original)
                      setEditSessionOpen(true)
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
    [setEditSessionOpen, setSelectedSession]
  )

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={sessionData || []} />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <TextField
            size='small'
            placeholder='Search session...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className='max-sm:is-full sm:min-is-[200px]'
          />
          <Button variant='contained' onClick={() => setAddSessionOpen(true)} className='max-sm:is-full'>
            Add New Session
          </Button>
        </div>
        <Divider />
        {grouped.length === 0 ? (
          <Box className='p-8 text-center'>
            <Typography color='text.secondary'>
              No sequences yet. Add sequences first on the Sequences page.
            </Typography>
          </Box>
        ) : (
          grouped.map(({ sequence, sessions }) => {
            const seqId = sequence._id
            const isExpanded = expandedSeq === seqId
            const page = sectionPages[seqId] ?? 0
            const paginatedSessions = sessions.slice(
              page * rowsPerPage,
              (page + 1) * rowsPerPage
            )
            const phaseName = sequence.cyclePhase?.displayName || sequence.cyclePhase?.name
            return (
              <Accordion
                key={seqId}
                expanded={isExpanded}
                onChange={() => setExpandedSeq(prev => (prev === seqId ? null : seqId))}
                sx={{
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line text-xl' />}>
                  <div className='flex items-center gap-3'>
                    <i className='ri-folder-3-line text-2xl text-primary' />
                    <Typography variant='subtitle1' fontWeight={600}>
                      {sequence.displayName || sequence.name}
                    </Typography>
                    {phaseName && (
                      <Chip size='small' label={phaseName} variant='tonal' color='secondary' />
                    )}
                    <Chip
                      size='small'
                      label={`${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
                      variant='outlined'
                    />
                    <Button
                      size='small'
                      variant='text'
                      onClick={e => {
                        e.stopPropagation()
                        setInitialSequenceId(seqId)
                        setAddSessionOpen(true)
                      }}
                    >
                      {sessions.length === 0 ? 'Add first session' : 'Add session'}
                    </Button>
                  </div>
                </AccordionSummary>
                <AccordionDetails className='p-0'>
                  {sessions.length === 0 ? (
                    <Box className='p-6 text-center bg-actionHover'>
                      <Typography color='text.secondary' className='mbe-2'>
                        No sessions in this sequence yet.
                      </Typography>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                          setInitialSequenceId(seqId)
                          setAddSessionOpen(true)
                        }}
                      >
                        Add first session
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
                            {paginatedSessions.map(sess => (
                              <tr key={sess._id}>
                                {columns.map(col => (
                                  <td key={col.id}>
                                    {col.cell
                                      ? col.cell({
                                          row: { original: sess, id: sess._id },
                                          getValue: () => sess[col.accessorKey || col.id]
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
                        count={sessions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
                        rowsPerPageOptions={[5, 10, 25]}
                        onPageChange={(_, newPage) =>
                          setSectionPages(prev => ({ ...prev, [seqId]: newPage }))
                        }
                        onRowsPerPageChange={e => {
                          setRowsPerPage(Number(e.target.value))
                          setSectionPages(prev => ({ ...prev, [seqId]: 0 }))
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
        title='Delete Session'
        subtitle='Are you sure? This will delete the session and all related steps.'
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SessionListTable
