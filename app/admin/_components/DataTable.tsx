'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import {
  IoChevronBack,
  IoChevronForward,
  IoSearch,
  IoArrowDown,
  IoArrowUp,
  IoFilter
} from 'react-icons/io5'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
}

export function DataTable<TData, TValue> ({
  columns,
  data,
  searchKey
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    onGlobalFilterChange: setGlobalFilter
  })

  return (
    // FLEX CONTAINER: Tüm yüksekliği kapla (h-full)
    <div className='h-full flex flex-col p-3 gap-3'>
      {/* 1. TOOLBAR (Sabit) */}
      <div className='shrink-0 flex items-center justify-between'>
        <div className='relative w-full max-w-xs group'>
          <IoSearch
            className='absolute left-2.5 top-1/2 -translate-y-1/2 text-admin-muted group-focus-within:text-admin-accent transition-colors'
            size={14}
          />
          <input
            placeholder='Ara...'
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(event.target.value)}
            className='admin-input-base pl-8 w-full'
          />
        </div>
        <div className='flex items-center gap-2'>
          <button className='h-admin-field px-3 rounded-admin border border-admin-input-border bg-admin-card text-admin-muted hover:text-admin-fg text-admin-tiny flex items-center gap-2 transition-colors font-medium uppercase tracking-wide'>
            <IoFilter />
            <span className='hidden sm:inline'>Filtrele</span>
          </button>
        </div>
      </div>

      {/* 2. TABLO ALANI (Scrollable) */}
      {/* flex-1 ve overflow-auto buraya verilir. Sadece burası kayar. */}
      <div className='flex-1 border border-admin-card-border rounded-admin overflow-hidden flex flex-col bg-admin-card'>
        <div className='flex-1 overflow-auto'>
          <table className='w-full text-left border-collapse'>
            {/* HEADER: Sticky yapılabilir */}
            <thead className='sticky top-0 z-10 bg-admin-bg text-admin-muted uppercase font-semibold border-b border-admin-card-border shadow-sm'>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        key={header.id}
                        className='px-3 py-2.5 select-none tracking-wide text-admin-tiny whitespace-nowrap bg-admin-bg'
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-1 hover:text-admin-fg transition-colors cursor-pointer`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <IoArrowUp size={10} />,
                              desc: <IoArrowDown size={10} />
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            <tbody className='divide-y divide-admin-input-border/50'>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className='hover:bg-admin-input-bg/50 transition-colors group'
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className='px-3 py-2 text-admin-fg text-admin-sm align-middle whitespace-nowrap'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='h-24 text-center text-admin-muted italic text-admin-sm'
                  >
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PAGINATION (Sabit, en altta) */}
      <div className='shrink-0 flex items-center justify-between px-1'>
        <div className='text-admin-tiny text-admin-muted'>
          <strong>{table.getFilteredRowModel().rows.length}</strong> kayıt
        </div>
        <div className='flex items-center gap-1'>
          <button
            className='admin-btn-icon disabled:opacity-30'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IoChevronBack size={12} />
          </button>

          <span className='text-admin-tiny font-medium text-admin-muted px-2'>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>

          <button
            className='admin-btn-icon disabled:opacity-30'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IoChevronForward size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
