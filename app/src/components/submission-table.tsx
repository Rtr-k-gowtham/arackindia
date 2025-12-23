"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Eye, Search } from "lucide-react"
import { SubmissionDrawer } from "./submission-drawer"
import { Badge } from "@/components/ui/badge"

interface SubmissionTableProps {
    data: any[]
}

export function SubmissionTable({ data }: SubmissionTableProps) {
    const [globalFilter, setGlobalFilter] = useState("")
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Columns definition
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "created_at",
            header: "Date & Time",
            cell: ({ row }) => {
                return <div className="font-medium">{new Date(row.getValue("created_at")).toLocaleString()}</div>
            },
        },
        {
            id: "name",
            header: "Name",
            accessorFn: (row) => {
                // Try to find Name case-insensitively
                if (!row.data) return "N/A"
                const keys = ['name', 'fullname', 'full_name', 'username']
                for (const k of Object.keys(row.data)) {
                    if (keys.includes(k.toLowerCase())) return row.data[k]
                }
                return "N/A"
            },
            cell: ({ row }) => <div className="capitalize">{String(row.getValue("name"))}</div>,
        },
        {
            id: "email",
            header: "Email",
            accessorFn: (row) => {
                if (!row.data) return "N/A"
                const keys = ['email', 'mail', 'e-mail']
                for (const k of Object.keys(row.data)) {
                    if (keys.includes(k.toLowerCase())) return row.data[k]
                }
                return "N/A"
            },
        },
        {
            id: "phone",
            header: "Phone",
            accessorFn: (row) => {
                if (!row.data) return "N/A"
                const keys = ['phone', 'mobile', 'cell', 'contact']
                for (const k of Object.keys(row.data)) {
                    if (keys.includes(k.toLowerCase())) return row.data[k]
                }
                return "N/A"
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedSubmission(row.original)
                            setIsDrawerOpen(true)
                        }}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </Button>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const safeValue = (() => {
                const value = row.getValue(columnId);
                return typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase();
            })();
            return safeValue.includes(String(filterValue).toLowerCase())
        }
    })

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search all columns..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-9 bg-background border-slate-200 dark:border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-1 transition-all rounded-full"
                    />
                </div>
                <div className="text-sm text-muted-foreground hidden sm:block">
                    {table.getFilteredRowModel().rows.length} record(s) found
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/30 border-slate-100 dark:border-slate-800 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="pl-6 py-4">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0 rounded-full"
                    >
                        <span className="sr-only">Previous</span>
                        &lt;
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0 rounded-full"
                    >
                        <span className="sr-only">Next</span>
                        &gt;
                    </Button>
                </div>
            </div>

            <SubmissionDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                submission={selectedSubmission}
            />
        </div>
    )
}
