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
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@components/admin/ConfirmationDialog'
import { toast } from 'react-toastify'
import { adminAPI } from '@/utils/api'

// Util Imports
import { getInitials } from '@/utils/getInitials'

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

const GiftListTable = ({ tableData, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState(null)
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
      await adminAPI.deleteGift(selectedGift._id)
      toast.success('Gift deleted successfully')
      setDeleteDialogOpen(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.message || 'Error deleting gift')
    }
  }

  const handleDeleteClick = (gift) => {
    setSelectedGift(gift)
    setDeleteDialogOpen(true)
  }

  const getAvatar = params => {
    const { name, email } = params
    const fullName = name || email?.split('@')[0] || 'U'

    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(fullName)}
      </CustomAvatar>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A'
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
      columnHelper.accessor('recipient', {
        header: 'Recipient',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ name: row.original.recipient?.name, email: row.original.recipient?.email })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.recipient?.name || row.original.recipient?.email || 'N/A'}
              </Typography>
              <Typography variant='body2'>{row.original.recipient?.email || ''}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('sender', {
        header: 'Sender',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.sender?.name || 'Anonymous'}
          </Typography>
        )
      }),
      columnHelper.accessor('plan', {
        header: 'Plan',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.plan}
            size='small'
            color={row.original.plan === 'yearly' ? 'primary' : 'success'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {formatPrice(row.original.amount)}
          </Typography>
        )
      }),
      columnHelper.accessor('giftedAt', {
        header: 'Gifted At',
        cell: ({ row }) => <Typography>{formatDate(row.original.giftedAt)}</Typography>
      }),
      columnHelper.accessor('redeemedAt', {
        header: 'Redeemed At',
        cell: ({ row }) => <Typography>{formatDate(row.original.redeemedAt)}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'pending'
          return (
            <Chip
              variant='tonal'
              label={status}
              size='small'
              color={
                status === 'redeemed' ? 'success' :
                status === 'pending' ? 'warning' :
                status === 'expired' ? 'error' : 'default'
              }
              className='capitalize'
            />
          )
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
            placeholder='Search Gifts'
            className='max-sm:is-full'
          />
            <Button variant='contained' className='max-sm:is-full'>
              Add New Gift
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
      title='Delete Gift'
      message={`Are you sure you want to delete this gift? This action cannot be undone.`}
      confirmText='Yes, Delete Gift!'
      type='delete'
    />
    </>
  )
}

export default GiftListTable

