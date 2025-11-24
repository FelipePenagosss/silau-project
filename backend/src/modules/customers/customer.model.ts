export interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CustomerCreateDTO {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
}

export interface CustomerUpdateDTO {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  document_type?: string;
  document_number?: string;
}

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
