import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link className="mr-6 flex items-center space-x-2" href="/dashboard">
                            <span className="hidden font-bold sm:inline-block">FormDash</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Add search or other controls here */}
                        </div>
                        <nav className="flex items-center">
                            <form action={async () => {
                                'use server'
                                const supabase = await createClient()
                                await supabase.auth.signOut()
                                redirect('/login')
                            }}>
                                <Button variant="ghost">Sign Out</Button>
                            </form>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-6 grid gap-6">
                {children}
            </main>
        </div>
    )
}
