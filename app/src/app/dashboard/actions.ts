'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase.from('projects').insert({
        name,
        description,
        user_id: user.id,
    })

    if (error) {
        console.error('Error creating project:', error)
        return { error: 'Failed to create project' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteProject(formData: FormData) {
    const supabase = await createClient()
    const projectId = formData.get('projectId') as string

    const { error } = await supabase.from('projects').delete().eq('id', projectId)

    if (error) {
        console.error('Error deleting project:', error)
        return { error: 'Failed to delete project' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
