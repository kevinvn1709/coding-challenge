export interface User {
  id?: number;
  name: string;
  email: string;
  age?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
  status?: 'active' | 'inactive';
}

export interface UserFilters {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
  age_min?: number;
  age_max?: number;
  limit?: number;
  offset?: number;
}
