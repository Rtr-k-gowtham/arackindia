import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { ArrowLeft, Code, Database, CalendarClock, Activity } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmissionsChart } from '@/components/submissions-chart'
import { SubmissionTable } from '@/components/submission-table'
import { ExportButton } from '@/components/export-button'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (!project) {
        notFound()
    }

    const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const endpoint = `${baseUrl}/api/submit/${project.id}`

    // Prepare chart data (group by date)
    const chartDataMap = new Map<string, number>()
    submissions?.forEach(sub => {
        const date = new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        chartDataMap.set(date, (chartDataMap.get(date) || 0) + 1)
    })

    // Convert reversed map to array and reverse to show oldest to newest if needed, or just last 7 days
    const chartData = Array.from(chartDataMap.entries()).map(([date, count]) => ({ date, count })).reverse().slice(0, 7).reverse()

    const htmlSnippet = `<form action="${endpoint}" method="POST">
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>`

    const jsSnippet = `const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  await fetch('${endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}`

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary">{project.name}</h1>
                        <p className="text-muted-foreground mt-1">{project.description || "No description provided."}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="shadow-sm">
                                <Code className="mr-2 h-4 w-4" /> Integration Guide
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>How to use in your app</DialogTitle>
                                <DialogDescription>
                                    Choose your preferred integration method.
                                </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="html" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="html">HTML Form</TabsTrigger>
                                    <TabsTrigger value="js">JavaScript / React</TabsTrigger>
                                </TabsList>
                                <TabsContent value="html">
                                    <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto my-4 shadow-inner">
                                        <pre className="text-xs sm:text-sm font-mono text-white">
                                            {htmlSnippet}
                                        </pre>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        The simplest way. Just copy this form into your HTML file.
                                    </p>
                                </TabsContent>
                                <TabsContent value="js">
                                    <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto my-4 shadow-inner">
                                        <pre className="text-xs sm:text-sm font-mono text-white">
                                            {jsSnippet}
                                        </pre>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Best for React, Vue, or modern web apps. Use fetch to send JSON data.
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                    <ExportButton data={submissions || []} filename={`${project.name}_submissions`} />
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Database className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{submissions?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime collected records
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Submission</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CalendarClock className="h-4 w-4 text-green-600 dark:text-green-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-nowrap truncate text-ellipsis text-slate-900 dark:text-slate-100">
                            {submissions && submissions.length > 0
                                ? new Date(submissions[0].created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {submissions && submissions.length > 0
                                ? new Date(submissions[0].created_at).toLocaleTimeString()
                                : "No activity yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Project Status</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ready to receive data
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Data Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 space-y-6">
                    <h3 className="text-lg font-semibold tracking-tight">Analytics</h3>
                    <SubmissionsChart data={chartData} />
                </div>
                <Card className="col-span-3 shadow-none border-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                        <CardDescription>
                            Latest 5 submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="space-y-4">
                            {submissions?.slice(0, 5).map((sub) => (
                                <div key={sub.id} className="group flex items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {Object.values(sub.data || {})[0]?.toString().charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                            {String(Object.values(sub.data || {})[0] || "Unknown").slice(0, 25)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(sub.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!submissions || submissions.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed text-muted-foreground bg-muted/20">
                                    <p className="text-sm">No recent activity.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Data Records</CardTitle>
                            <CardDescription className="mt-1">
                                Comprehensive view of all submissions.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {submissions && submissions.length > 0 ? (
                        <div className="p-6">
                            <SubmissionTable data={submissions} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <div className="p-4 bg-muted/50 rounded-full mb-4">
                                <Database className="h-10 w-10 opacity-40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No data collected yet</h3>
                            <p className="text-sm max-w-sm text-center mt-2">
                                Use the Integration Guide to start sending data to this project. Your records will appear here.
                            </p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="mt-6">
                                        View Integration Guide
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>How to use in your app</DialogTitle>
                                        <DialogDescription>
                                            Choose your preferred integration method.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Tabs defaultValue="html" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="html">HTML Form</TabsTrigger>
                                            <TabsTrigger value="js">JavaScript / React</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="html">
                                            <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto my-4 shadow-inner">
                                                <pre className="text-xs sm:text-sm font-mono text-white">
                                                    {htmlSnippet}
                                                </pre>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                The simplest way. Just copy this form into your HTML file.
                                            </p>
                                        </TabsContent>
                                        <TabsContent value="js">
                                            <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto my-4 shadow-inner">
                                                <pre className="text-xs sm:text-sm font-mono text-white">
                                                    {jsSnippet}
                                                </pre>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Best for React, Vue, or modern web apps. Use fetch to send JSON data.
                                            </p>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

