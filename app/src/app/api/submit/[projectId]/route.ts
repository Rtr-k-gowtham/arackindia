import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const projectId = (await params).projectId

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400, headers: corsHeaders })
    }

    try {
        const contentType = request.headers.get('content-type') || ''
        let body: Record<string, any> = {}

        if (contentType.includes('application/json')) {
            body = await request.json()
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData()
            const entries = Array.from(formData.entries())

            // Convert formData to object, handling multiple values for same key if needed
            // For simplicity, we'll just take the last value or map properly
            entries.forEach(([key, value]) => {
                body[key] = value
            })
        } else {
            // Fallback or error
            return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400, headers: corsHeaders })
        }

        const supabase = await createClient()

        const { error } = await supabase.from('submissions').insert({
            project_id: projectId,
            data: body,
        })

        if (error) {
            console.error("Submission error:", error)
            return NextResponse.json({ error: 'Failed to save submission' }, { status: 500, headers: corsHeaders })
        }

        // Check if it's a form submission that expects a redirect (HTML form)
        // If Accept header includes text/html, redirect back to referrer
        const accept = request.headers.get('accept') || ''
        if (accept.includes('text/html') && !contentType.includes('application/json')) {
            const referer = request.headers.get('referer')
            if (referer) {
                return NextResponse.redirect(referer + '?success=true', { status: 303 })
            }
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders })
    } catch (err) {
        console.error("Submission exception:", err)
        return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders })
    }
}
