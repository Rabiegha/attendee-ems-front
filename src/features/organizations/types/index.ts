export interface Organization {
  id: string
  name: string
  slug: string
  timezone: string
  plan_code?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateOrganizationRequest {
  name: string
  slug: string
  timezone: string
}

export interface CreateOrganizationResponse extends Organization {
  // Le backend retourne directement un objet Organization
}

export interface GetOrganizationsResponse {
  organizations: Organization[]
}

export interface GetOrganizationUsersResponse {
  users: OrganizationUser[]
}

export interface OrganizationUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  role: {
    id: string
    code: string
    name: string
    description?: string
  }
}
