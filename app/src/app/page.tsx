import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Form Data Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          The easiest way to collect and manage form submissions from your applications.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="https://github.com/your-repo">
            <Button variant="outline" size="lg">GitHub</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
