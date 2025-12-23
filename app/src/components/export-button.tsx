"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExportButtonProps {
    data: any[]
    filename?: string
}

export function ExportButton({ data, filename = "submissions" }: ExportButtonProps) {
    const handleExport = () => {
        try {
            if (!data || data.length === 0) {
                toast.error("No data to export")
                return
            }

            // 1. Prepare Summary Sheet Data
            // Fixed columns: Date, Name, Email, Phone
            const summaryData = data.map(item => {
                // Try to find Name, Email, Phone case-insensitively in data payload
                const findField = (keys: string[]) => {
                    if (!item.data) return "N/A"
                    for (const k of Object.keys(item.data)) {
                        if (keys.includes(k.toLowerCase())) return item.data[k]
                    }
                    return ""
                }

                return {
                    "ID": item.id,
                    "Date": new Date(item.created_at).toLocaleString(),
                    "Name": findField(['name', 'fullname', 'full_name', 'username']),
                    "Email": findField(['email', 'mail', 'e-mail']),
                    "Phone": findField(['phone', 'mobile', 'cell', 'contact']),
                }
            })

            // 2. Prepare Details Sheet Data
            // Flatten everything
            const allKeys = new Set<string>()
            data.forEach(item => {
                if (item.data && typeof item.data === 'object') {
                    Object.keys(item.data).forEach(k => allKeys.add(k))
                }
            })
            const dynamicKeys = Array.from(allKeys)

            const detailsData = data.map(item => {
                const row: any = {
                    "Submission ID": item.id,
                    "Date": new Date(item.created_at).toLocaleString(),
                }
                dynamicKeys.forEach(key => {
                    row[key] = item.data?.[key] || ""
                })
                return row
            })

            // 3. Create Workbook
            const wb = XLSX.utils.book_new()

            const wsSummary = XLSX.utils.json_to_sheet(summaryData)
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

            const wsDetails = XLSX.utils.json_to_sheet(detailsData)
            XLSX.utils.book_append_sheet(wb, wsDetails, "Details")

            // 4. Download
            XLSX.writeFile(wb, `${filename}.xlsx`)

            toast.success("Export successful", {
                description: "Your Excel file has been downloaded."
            })
        } catch (error) {
            console.error("Export error:", error)
            toast.error("Failed to export data")
        }
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
    )
}
