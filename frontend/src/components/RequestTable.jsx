import { useState, useEffect, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { supabase } from '../lib/supabaseClient'
import { ArrowUpDown } from 'lucide-react'

export function RequestTable() {
    const [data, setData] = useState([])
    const [sorting, setSorting] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()

        // Realtime subscription
        const subscription = supabase
            .channel('public:requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests)
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchRequests = async () => {
        try {
            const { data: requests, error } = await supabase
                .from('requests')
                .select('*, requester:users(full_name, phone_number)')
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            setData(requests)
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'blood_type',
                header: ({ column }) => {
                    return (
                        <button
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Blood Type
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    )
                },
                cell: ({ row }) => <span className="font-bold text-red-500">{row.getValue('blood_type') || '-'}</span>,
            },
            {
                accessorKey: 'location',
                header: 'Location',
                cell: ({ row }) => row.getValue('location') || '-',
            },
            {
                accessorKey: 'urgency',
                header: 'Urgency',
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.getValue('urgency') === 'High'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}
                    >
                        {row.getValue('urgency') || 'Normal'}
                    </span>
                ),
            },
            {
                accessorKey: 'requester.full_name', // Accessing nested data
                header: 'Requester',
                cell: ({ row }) => row.original.requester?.full_name || '-',
            },
            {
                accessorKey: 'requester.phone_number',
                header: 'Phone',
                cell: ({ row }) => row.original.requester?.phone_number || '-',
            },
            {
                accessorKey: 'donors_found',
                header: 'Donors',
                cell: ({ row }) => row.getValue('donors_found') || 0,
            },
            {
                accessorKey: 'is_active',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.getValue('is_active')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {row.getValue('is_active') ? 'Active' : 'Closed'}
                    </span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Time',
                cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleString(),
            },
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    })

    if (loading) return <div className="text-gray-400 animate-pulse">Loading requests...</div>

    return (
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
                                className="hover:bg-gray-800/30 transition-colors"
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
                                No requests found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
