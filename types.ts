export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export type EmployeeFormData = Omit<Employee, 'id'>;

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface GasPostPayload {
  action: 'create' | 'update' | 'delete';
  data?: Partial<Employee>;
  id?: string;
}

export enum AppView {
  LIST = 'LIST',
  SETUP = 'SETUP',
}
