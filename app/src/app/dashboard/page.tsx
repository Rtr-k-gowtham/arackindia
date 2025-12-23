import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <CreateProjectDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects?.map((project) => (
                    <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Created {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {(!projects || projects.length === 0) && (
                    <Card className="col-span-full border-dashed shadow-none p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-muted">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">No projects created</h3>
                            <p className="text-sm text-muted-foreground">Get started by creating your first project.</p>
                        </div>
                        <CreateProjectDialog />
                    </Card>
                )}
            </div>
        </div>
    )
}
