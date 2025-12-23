import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-xl font-semibold">Sorry, something went wrong</p>
            <p className="text-muted-foreground">Please check the server logs for more details.</p>
            <Link href="/login">
                <Button>Back to Login</Button>
            </Link>
        </div>
    )
}
