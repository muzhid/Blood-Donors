import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import { useMemo } from 'react'

export function CommandTable() {
    const data = useMemo(() => [
        {
            command: '/start',
            description: 'Start the bot. Shows welcome menu for Seekers/Donors. Checks registration status.',
            example: '/start',
            context: 'Private Chat'
        },
        {
            command: '(Share Contact)',
            description: 'Register as a new donor. Button available in /start menu.',
            example: '📎 > Contact',
            context: 'Private Chat'
        },
        {
            command: 'Welcome Back!',
            description: 'Main Menu (Keyboard). Opens the Blood Request & Profile menu.',
            example: 'Button Click',
            context: 'Private Chat'
        },
        {
            command: '[Photo Upload]',
            description: 'Admin Feature: Upload a Maldives ID Card image to auto-register or update a user. Supports OCR.',
            example: '(Upload Image)',
            context: 'Admin Group'
        },
        {
            command: '/admin_access',
            description: 'Generate temporary credentials for Admin Dashboard login.',
            example: '/admin_access',
            context: 'Admin Group'
        },
        {
            command: '/reset_password',
            description: 'Reset the Admin Dashboard password.',
            example: '/reset_password',
            context: 'Admin Group'
        },
        {
            command: '/update',
            description: 'Open interactive Profile Dashboard.',
            example: '/update',
            context: 'Private Chat'
        },
        {
            command: '/donor',
            description: 'Resume profile completion or check stats.',
            example: '/donor',
            context: 'Private Chat'
        },
        {
            command: '/profile',
            description: 'View or Edit Profile details.',
            example: '/profile',
            context: 'Private Chat'
        }
    ], [])

    const columns = useMemo(
        () => [
            {
                accessorKey: 'command',
                header: 'Command',
                cell: ({ row }) => <code className="bg-slate-800 px-2 py-1 rounded text-red-400 font-mono text-sm">{row.getValue('command')}</code>,
            },
            {
                accessorKey: 'description',
                header: 'Description',
            },
            {
                accessorKey: 'example',
                header: 'Example Usage',
                cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{row.getValue('example')}</span>,
            },
            {
                accessorKey: 'context',
                header: 'Context',
                cell: ({ row }) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${row.getValue('context').includes('Group')
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-slate-800 text-slate-400'
                        }`}>
                        {row.getValue('context')}
                    </span>
                )
            }
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <h2 className="text-lg font-semibold text-gray-100">Bot Command Reference</h2>
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
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-800/30 transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className={`px-6 py-4 ${cell.column.id === 'description' || cell.column.id === 'example'
                                        ? 'whitespace-normal min-w-[200px]'
                                        : 'whitespace-nowrap'
                                        }`}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
