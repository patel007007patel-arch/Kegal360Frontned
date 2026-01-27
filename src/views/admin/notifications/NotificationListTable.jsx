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
import AddNotificationDialog from './AddNotificationDialog'
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

const notificationTypeObj = {
  period_reminder: { label: 'Period Reminder', color: 'error' },
  ovulation_reminder: { label: 'Ovulation Reminder', color: 'warning' },
  log_reminder: { label: 'Log Reminder', color: 'info' },
  yoga_reminder: { label: 'Yoga Reminder', color: 'success' },
  meditation_reminder: { label: 'Meditation Reminder', color: 'primary' },
  subscription: { label: 'Subscription', color: 'secondary' },
  general: { label: 'General', color: 'default' }
}

const NotificationListTable = ({ tableData, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[tableData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filters, setFilters] = useState({ type: '', isRead: '', userId: '' })

  useEffect(() => {
    setData(tableData)
    setFilteredData(tableData)
  }, [tableData])

  // Apply filters
  useEffect(() => {
    let filtered = [...data]

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type)
    }
    if (filters.isRead !== '') {
      filtered = filtered.filter(item => item.isRead === (filters.isRead === 'true'))
    }
    if (filters.userId) {
      filtered = filtered.filter(item => 
        item.user?.toLowerCase().includes(filters.userId.toLowerCase()) ||
        item.userEmail?.toLowerCase().includes(filters.userId.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }, [data, filters])

  const handleDelete = async () => {
    try {
      await adminAPI.deleteNotification(selectedNotification.id)
      toast.success('Notification deleted successfully')
      setDeleteDialogOpen(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting notification')
    }
  }

  const handleDeleteClick = (notification) => {
    setSelectedNotification(notification)
    setDeleteDialogOpen(true)
  }

  const handleMarkAsRead = async (notification, isRead) => {
    try {
      await adminAPI.updateNotification(notification.id, { isRead })
      toast.success(`Notification ${isRead ? 'marked as read' : 'marked as unread'}`)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error updating notification')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      columnHelper.accessor('user', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {row.original.user || 'N/A'}
            </Typography>
            {row.original.userEmail && (
              <Typography variant='body2' color='text.secondary'>
                {row.original.userEmail}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => {
          const typeInfo = notificationTypeObj[row.original.type] || notificationTypeObj.general
          return (
            <Chip
              variant='tonal'
              label={typeInfo.label}
              color={typeInfo.color}
              size='small'
            />
          )
        }
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.title || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('message', {
        header: 'Message',
        cell: ({ row }) => (
          <Typography className='max-w-[300px] truncate'>
            {row.original.message || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('isRead', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isRead ? 'Read' : 'Unread'}
            color={row.original.isRead ? 'success' : 'warning'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ row }) => <Typography>{formatDate(row.original.createdAt)}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              size='small'
              onClick={() => handleMarkAsRead(row.original, !row.original.isRead)}
              title={row.original.isRead ? 'Mark as unread' : 'Mark as read'}
            >
              <i className={classnames('text-xl', row.original.isRead ? 'ri-mail-open-line' : 'ri-mail-line')} />
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'small' }}
              options={[
                {
                  text: 'Download',
                  icon: <i className='ri-download-line text-xl' />
                },
                {
                  text: 'Edit',
                  icon: <i className='ri-pencil-line text-xl' />,
                  menuItemProps: {
                    onClick: () => {
                      // TODO: Implement edit functionality
                      toast.info('Edit functionality coming soon')
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: <i className='ri-delete-bin-7-line text-xl' />,
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original)
                  }
                }
              ]}
            />
          </div>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  return (
    <Card>
      <CardHeader
        title='Notifications'
        subheader='Manage all user notifications'
        action={
          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add New Notification
            </Button>
          </div>
        }
      />
      <Divider />
      <TableFilters filters={filters} setFilters={setFilters} />
      <Divider />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
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
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  <Typography className='p-4'>No notifications found</Typography>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component='div'
        className='border-t'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type='delete'
        title='Delete Notification'
        content={`Are you sure you want to delete this notification? This action cannot be undone.`}
        onConfirm={handleDelete}
      />

      <AddNotificationDialog
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
        onRefresh={onRefresh}
      />
    </Card>
  )
}

export default NotificationListTable

