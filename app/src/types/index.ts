export interface Project {
    id: string
    created_at: string
    name: string
    description?: string
    user_id: string
    api_key?: string // If we want to secure the endpoint with an API key
}

export interface Submission {
    id: string
    created_at: string
    project_id: string
    data: Record<string, any>
}
