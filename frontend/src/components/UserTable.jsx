import { useState, useEffect, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table'
import { supabase } from '../lib/supabaseClient'
import { ArrowUpDown, Plus, Search } from 'lucide-react'

import { EditUserModal } from './EditUserModal'

export function UserTable() {
    const [data, setData] = useState([])
    const [sorting, setSorting] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            // Re-fetch users
            const { data: users, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setData(users)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRowClick = (user) => {
        setSelectedUser(user)
        setIsModalOpen(true)
    }

    const handleUpdate = () => {
        fetchUsers() // Refresh data
    }

    // ... columns definition ...
    const columns = useMemo(
        () => [
            {
                accessorKey: 'full_name',
                header: 'Name',
            },
            {
                accessorKey: 'phone_number',
                header: 'Phone',
            },
            {
                accessorKey: 'blood_type',
                header: ({ column }) => {
                    return (
                        <button
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation() // Prevent row click
                                column.toggleSorting(column.getIsSorted() === 'asc')
                            }}
                        >
                            Blood Type
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    )
                },
                cell: ({ row }) => <span className="font-bold text-red-500">{row.getValue('blood_type') || '-'}</span>,
                filterFn: 'equals',
            },
            {
                accessorKey: 'sex',
                header: 'Sex',
                cell: ({ row }) => row.getValue('sex') || '-',
            },
            {
                accessorKey: 'address',
                header: 'Address',
                cell: ({ row }) => row.getValue('address') || '-',
            },
            {
                accessorKey: 'id_card_number',
                header: 'ID Card',
                cell: ({ row }) => row.getValue('id_card_number') || '-',
            },
            {
                accessorKey: 'last_donation_date',
                header: 'Last Donation',
                cell: ({ row }) => row.getValue('last_donation_date') || '-',
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.getValue('role') === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {row.getValue('role') || 'user'}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.getValue('status') === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {row.getValue('status') || 'active'}
                    </span>
                ),
            },
        ],
        []
    )

    const [columnFilters, setColumnFilters] = useState([])

    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    })

    if (loading) return <div className="text-gray-400 animate-pulse">Loading users...</div>

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <h2 className="text-lg font-semibold text-gray-100 self-start md:self-center">All Users</h2>
                <div className="flex-1 w-full md:w-auto flex justify-center px-0 md:px-4">
                    <div className="relative w-full md:max-w-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block pl-10 p-2.5 outline-none placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={() => {
                            setSelectedUser({})
                            setIsModalOpen(true)
                        }}
                        className="w-full md:w-auto flex justify-center items-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add User
                    </button>
                    <select
                        value={(table.getColumn('blood_type')?.getFilterValue() ?? '')}
                        onChange={(e) => table.getColumn('blood_type')?.setFilterValue(e.target.value)}
                        className="w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
                    >
                        <option value="">All Blood Types</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-xl border border-gray-800 overflow-x-auto bg-gray-900/50">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-800/50 text-gray-100 uppercase text-xs font-medium">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-4">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => handleRowClick(row.original)}
                                    className={`transition-colors cursor-pointer ${row.original.status === 'banned'
                                        ? 'bg-red-900/30 hover:bg-red-900/40 border border-red-900/50'
                                        : 'hover:bg-gray-800/60'
                                        }`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    No users found matching filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    )
}
