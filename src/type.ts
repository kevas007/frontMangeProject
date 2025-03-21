export interface Project {
  // columns
  id: number
  name: string
  description: string
  deadline: string | null
  state_id: number
  created_at: string | null
  updated_at: string | null
}

export interface ProjectState {
  // columns
  id: number
  project_id: number
  user_id: number
  created_at: string | null
  updated_at: string | null
}

export interface Role {
  // columns
  id: number
  name: string
  created_at: string | null
  updated_at: string | null
}

export interface State {
  // columns
  id: number
  name: string
  description: string
  created_at: string | null
  updated_at: string | null
}

export interface User {
  // columns
  id: number
  name: string
  email: string
  role_id: number
  password?: string
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UserLogin {
  email: string
  password?: string
}
