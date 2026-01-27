'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import TableFilters from './TableFilters'
import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@components/admin/ConfirmationDialog'
import { toast } from 'react-toastify'
import { adminAPI } from '@/utils/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const LogListTable = ({ tableData, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[tableData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    setData(tableData)
    setFilteredData(tableData)
  }, [tableData])

  const handleDelete = async () => {
    try {
      await adminAPI.deleteLog(selectedLog._id)
      toast.success('Log deleted successfully')
      setDeleteDialogOpen(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting log')
    }
  }

  const handleDeleteClick = (log) => {
    setSelectedLog(log)
    setDeleteDialogOpen(true)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.date)}</Typography>
      }),
      columnHelper.accessor('user', {
        header: 'User',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.user?.name || row.original.user?.email || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('phase', {
        header: 'Phase',
        cell: ({ row }) => {
          if (!row.original.phase) return <Typography>N/A</Typography>
          return (
            <Chip
              variant='tonal'
              label={row.original.phase}
              size='small'
              color={
                row.original.phase === 'period' ? 'error' :
                row.original.phase === 'ovulation' ? 'info' :
                row.original.phase === 'luteal' ? 'warning' : 'default'
              }
              className='capitalize'
            />
          )
        }
      }),
      columnHelper.accessor('flow', {
        header: 'Flow',
        cell: ({ row }) => (
          <Typography className='capitalize'>{row.original.flow || 'N/A'}</Typography>
        )
      }),
      columnHelper.accessor('mood', {
        header: 'Mood',
        cell: ({ row }) => {
          if (!row.original.mood || row.original.mood.length === 0) return <Typography>N/A</Typography>
          return (
            <div className='flex gap-1 flex-wrap'>
              {row.original.mood.map((m, i) => (
                <Chip key={i} label={m} size='small' variant='tonal' />
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('symptoms', {
        header: 'Symptoms',
        cell: ({ row }) => {
          if (!row.original.symptoms || row.original.symptoms.length === 0) return <Typography>N/A</Typography>
          return (
            <div className='flex gap-1 flex-wrap'>
              {row.original.symptoms.map((s, i) => (
                <Chip key={i} label={s} size='small' variant='tonal' color='warning' />
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('temperature', {
        header: 'Temperature',
        cell: ({ row }) => {
          const temp = row.original.temperature
          if (!temp?.value) return <Typography>N/A</Typography>
          return <Typography>{temp.value}°{temp.unit === 'celsius' ? 'C' : 'F'}</Typography>
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => handleDeleteClick(row.original)}>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'ri-download-line'
                },
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line'
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
    <Card>
      <CardHeader title='Filters' className='pbe-4' />
      <TableFilters setData={setFilteredData} tableData={data} />
      <Divider />
      <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
        <Button
          color='secondary'
          variant='outlined'
          startIcon={<i className='ri-upload-2-line' />}
          className='max-sm:is-full'
        >
          Export
        </Button>
        <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Logs'
            className='max-sm:is-full'
          />
            <Button variant='contained' className='max-sm:is-full'>
              Add New Log
            </Button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
    <ConfirmationDialog
      open={deleteDialogOpen}
      setOpen={setDeleteDialogOpen}
      onConfirm={handleDelete}
      title='Delete Log'
      message={`Are you sure you want to delete this log entry? This action cannot be undone.`}
      confirmText='Yes, Delete Log!'
      type='delete'
    />
    </>
  )
}

export default LogListTable

