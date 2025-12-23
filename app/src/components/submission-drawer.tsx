"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Code } from "lucide-react"

interface SubmissionDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    submission: any
}

export function SubmissionDrawer({ open, onOpenChange, submission }: SubmissionDrawerProps) {
    const [showRaw, setShowRaw] = useState(false)

    if (!submission) return null

    // Helper to format snake_case to Title Case
    const formatKey = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
    }

    // Helper to detect if value is "long text"
    const isLongText = (value: any) => {
        return typeof value === 'string' && value.length > 50
    }

    const renderValue = (value: any) => {
        if (value === null || value === undefined) return <span className="text-muted-foreground italic">Empty</span>
        if (typeof value === 'boolean') return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
        if (typeof value === 'object') return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
        return <span>{String(value)}</span>
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0 flex flex-col gap-0 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="p-6 bg-muted/30 border-b">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold">Submission Details</SheetTitle>
                        <SheetDescription className="flex items-center gap-2 text-sm mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                            Received on {new Date(submission.created_at).toLocaleString()}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Record Data</h4>
                        <div className="flex items-center space-x-2">
                            <Switch id="raw-mode" checked={showRaw} onCheckedChange={setShowRaw} />
                            <Label htmlFor="raw-mode" className="text-xs font-medium cursor-pointer">Raw JSON</Label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {!showRaw ? (
                            <div className="grid gap-6">
                                {Object.entries(submission.data || {}).map(([key, value]) => (
                                    <div key={key} className="space-y-1.5 p-3 rounded-lg hover:bg-muted/50 transition-colors -mx-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-[10px]">{formatKey(key)}</p>
                                        {isLongText(value) ? (
                                            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                {String(value)}
                                            </div>
                                        ) : (
                                            <div className="text-base font-medium text-foreground">
                                                {renderValue(value)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg bg-slate-950 p-6 shadow-inner overflow-hidden">
                                <code className="text-blue-200 text-xs whitespace-pre-wrap font-mono block">
                                    {JSON.stringify(submission, null, 2)}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
