import { ApiResponse, Employee, GasPostPayload } from '../types';

// NOTE: Google Apps Script Web Apps often have strict CORS policies.
// Sending data as 'text/plain' and parsing it in the backend using JSON.parse(e.postData.contents)
// is a common workaround to avoid preflight OPTIONS requests failing.

export const fetchEmployees = async (scriptUrl: string): Promise<Employee[]> => {
  try {
    // Append action=read to query string for GET, or use POST for everything
    const response = await fetch(`${scriptUrl}?action=read`, {
        method: 'GET', 
        // We use GET for reading. Ensure the script is deployed as "Execute as: Me" and "Access: Anyone"
    });
    
    const result: ApiResponse<Employee[]> = await response.json();
    if (result.status === 'success' && result.data) {
      return result.data;
    }
    throw new Error(result.message || 'Failed to fetch data');
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const createEmployee = async (scriptUrl: string, employee: Omit<Employee, 'id'>): Promise<Employee> => {
  const payload: GasPostPayload = {
    action: 'create',
    data: employee as Employee // The backend handles ID generation
  };
  return sendPostRequest(scriptUrl, payload);
};

export const updateEmployee = async (scriptUrl: string, employee: Employee): Promise<Employee> => {
  const payload: GasPostPayload = {
    action: 'update',
    data: employee
  };
  return sendPostRequest(scriptUrl, payload);
};

export const deleteEmployee = async (scriptUrl: string, id: string): Promise<void> => {
  const payload: GasPostPayload = {
    action: 'delete',
    id: id
  };
  await sendPostRequest(scriptUrl, payload);
};

const sendPostRequest = async (url: string, payload: GasPostPayload): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      // Important: Use text/plain to avoid CORS preflight (OPTIONS)
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse<any> = await response.json();
    if (result.status === 'success') {
      return result.data;
    }
    throw new Error(result.message || 'Operation failed');
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
