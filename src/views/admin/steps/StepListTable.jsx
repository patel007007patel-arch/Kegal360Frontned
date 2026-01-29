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

function groupStepsBySession(steps, sessions) {
  const bySession = {}
  const sessList = Array.isArray(sessions) ? [...sessions] : []
  sessList.forEach(sess => {
    bySession[sess._id] = { session: sess, steps: [] }
  })
  ;(steps || []).forEach(step => {
    const sessId = step.session?._id || step.session
    if (sessId && bySession[sessId]) {
      bySession[sessId].steps.push(step)
    }
  })
  return sessList.map(sess => ({
    session: sess,
    steps: bySession[sess._id]?.steps || []
  }))
}

const StepListTable = ({
  stepData,
  sessions = [],
  setAddStepOpen,
  setInitialSessionId,
  setEditStepOpen,
  setSelectedStep,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stepToDelete, setStepToDelete] = useState(null)
  const [expandedSession, setExpandedSession] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sectionPages, setSectionPages] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  useEffect(() => {
    setFilteredData(stepData || [])
  }, [stepData])

  const handleDeleteClick = step => {
    setStepToDelete(step)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteStep(stepToDelete._id)
      toast.success('Step deleted successfully')
      setDeleteDialogOpen(false)
      setStepToDelete(null)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting step')
    }
  }

  const filteredBySearch = useMemo(() => {
    const list = filteredData || []
    if (!globalFilter.trim()) return list
    const q = globalFilter.toLowerCase().trim()
    return list.filter(item => (item.title || '').toLowerCase().includes(q))
  }, [filteredData, globalFilter])

  const grouped = useMemo(
    () => groupStepsBySession(filteredBySearch, sessions),
    [filteredBySearch, sessions]
  )

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.title}</Typography>
      }),
      columnHelper.accessor('timer', {
        header: 'Timer',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.timer}s</Typography>
      }),
      columnHelper.accessor('restTime', {
        header: 'Rest',
        cell: ({ row }) => (
          <Typography color='text.primary'>{row.original.restTime || 0}s</Typography>
        )
      }),
      columnHelper.accessor('order', {
        header: 'Order',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.order}</Typography>
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
                      setSelectedStep(row.original)
                      setEditStepOpen(true)
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
    [setEditStepOpen, setSelectedStep]
  )

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={stepData || []} />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <TextField
            size='small'
            placeholder='Search step...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className='max-sm:is-full sm:min-is-[200px]'
          />
          <Button variant='contained' onClick={() => setAddStepOpen(true)} className='max-sm:is-full'>
            Add New Step
          </Button>
        </div>
        <Divider />
        {grouped.length === 0 ? (
          <Box className='p-8 text-center'>
            <Typography color='text.secondary'>
              No sessions yet. Add sessions first on the Sessions page.
            </Typography>
          </Box>
        ) : (
          grouped.map(({ session, steps }) => {
            const sessId = session._id
            const isExpanded = expandedSession === sessId
            const page = sectionPages[sessId] ?? 0
            const paginatedSteps = steps.slice(
              page * rowsPerPage,
              (page + 1) * rowsPerPage
            )
            const seqName = session.sequence?.displayName || session.sequence?.name
            return (
              <Accordion
                key={sessId}
                expanded={isExpanded}
                onChange={() => setExpandedSession(prev => (prev === sessId ? null : sessId))}
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
                      {session.title}
                    </Typography>
                    {seqName && (
                      <Chip size='small' label={seqName} variant='tonal' color='secondary' />
                    )}
                    <Chip
                      size='small'
                      label={`${steps.length} step${steps.length !== 1 ? 's' : ''}`}
                      variant='outlined'
                    />
                    <Button
                      size='small'
                      variant='text'
                      onClick={e => {
                        e.stopPropagation()
                        setInitialSessionId(sessId)
                        setAddStepOpen(true)
                      }}
                    >
                      {steps.length === 0 ? 'Add first step' : 'Add step'}
                    </Button>
                  </div>
                </AccordionSummary>
                <AccordionDetails className='p-0'>
                  {steps.length === 0 ? (
                    <Box className='p-6 text-center bg-actionHover'>
                      <Typography color='text.secondary' className='mbe-2'>
                        No steps in this session yet.
                      </Typography>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                          setInitialSessionId(sessId)
                          setAddStepOpen(true)
                        }}
                      >
                        Add first step
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
                            {paginatedSteps.map(step => (
                              <tr key={step._id}>
                                {columns.map(col => (
                                  <td key={col.id}>
                                    {col.cell
                                      ? col.cell({
                                          row: { original: step, id: step._id },
                                          getValue: () => step[col.accessorKey || col.id]
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
                        count={steps.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        SelectProps={{ inputProps: { 'aria-label': 'rows per page' } }}
                        rowsPerPageOptions={[5, 10, 25]}
                        onPageChange={(_, newPage) =>
                          setSectionPages(prev => ({ ...prev, [sessId]: newPage }))
                        }
                        onRowsPerPageChange={e => {
                          setRowsPerPage(Number(e.target.value))
                          setSectionPages(prev => ({ ...prev, [sessId]: 0 }))
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
        title='Delete Step'
        subtitle='Are you sure you want to delete this step?'
        onConfirm={handleDelete}
      />
    </>
  )
}

export default StepListTable
