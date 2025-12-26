
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Database, 
  Settings, 
  User, 
  Briefcase, 
  Mail, 
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Employee, EmployeeFormData, AppView } from './types';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from './services/sheetApi';
import { generateMockData } from './services/gemini';
import { InstructionModal } from './components/InstructionModal';
import { INITIAL_FORM_STATE } from './constants';

const App: React.FC = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // URL from Environment Variable
  const scriptUrl = process.env.GOOGLE_SHEET_SCRIPT_URL || '';
  
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_STATE);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Load
  const loadData = useCallback(async () => {
    if (!scriptUrl) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees(scriptUrl);
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data. Check your connection or URL.');
    } finally {
      setLoading(false);
    }
  }, [scriptUrl]);

  useEffect(() => {
    if (scriptUrl) {
      loadData();
    } else {
      setIsSetupOpen(true);
    }
  }, [scriptUrl, loadData]);

  // Handlers
  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      role: employee.role,
      department: employee.department,
      email: employee.email,
      status: employee.status as any,
    });
    setEditingId(employee.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    try {
      await deleteEmployee(scriptUrl, id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateEmployee(scriptUrl, { ...formData, id: editingId });
        setEmployees(prev => prev.map(emp => emp.id === editingId ? { ...formData, id: editingId } : emp));
      } else {
        const newEmp = await createEmployee(scriptUrl, formData);
        setEmployees(prev => [...prev, newEmp]);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      alert('Operation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
  };

  const handleGenerateAiData = async () => {
    if (!scriptUrl) {
        setIsSetupOpen(true);
        return;
    }
    setAiLoading(true);
    try {
        const mockData = await generateMockData();
        // Sequentially add them to avoid overwhelming the GAS lock service
        for (const data of mockData) {
            const newEmp = await createEmployee(scriptUrl, data);
            setEmployees(prev => [...prev, newEmp]);
        }
    } catch (err: any) {
        alert("AI Generation failed: " + err.message);
    } finally {
        setAiLoading(false);
    }
  };

  // Filter
  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    const name = emp.name ? String(emp.name).toLowerCase() : '';
    const role = emp.role ? String(emp.role).toLowerCase() : '';
    const dept = emp.department ? String(emp.department).toLowerCase() : '';
    
    return name.includes(term) || role.includes(term) || dept.includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <InstructionModal 
        isOpen={isSetupOpen} 
        onClose={() => setIsSetupOpen(false)} 
      />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                SheetBase
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSetupOpen(true)}
                className={`p-2 rounded-full transition-colors ${!scriptUrl ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Configuration"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all sm:text-sm shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading || !scriptUrl}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
             <button
              onClick={handleGenerateAiData}
              disabled={aiLoading || loading || !scriptUrl}
              className="inline-flex items-center px-4 py-2.5 border border-purple-200 text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-all disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Mock Data
            </button>
            <button
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              disabled={!scriptUrl}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
              <button onClick={() => setIsSetupOpen(true)} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 underline">
                Check Configuration
              </button>
            </div>
          </div>
        )}

        {/* Empty State when no URL */}
        {!scriptUrl && (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Environment Not Configured</h3>
                <p className="mt-1 text-sm text-gray-500">
                    The <code>GOOGLE_SHEET_SCRIPT_URL</code> environment variable is missing.
                </p>
                <div className="mt-6">
                    <button
                        onClick={() => setIsSetupOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        View Setup Instructions
                    </button>
                </div>
            </div>
        )}

        {/* Data Table */}
        {scriptUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading && filteredEmployees.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center">
                                <Loader2 className="w-8 h-8 mx-auto text-green-600 animate-spin" />
                                <p className="mt-2 text-sm text-gray-500">Loading data from Sheets...</p>
                            </td>
                        </tr>
                    ) : filteredEmployees.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-24 text-center text-gray-500">
                           <div className="flex flex-col items-center justify-center">
                                <User className="w-12 h-12 text-gray-300 mb-2" />
                                <p className="text-lg font-medium text-gray-900">No employees found</p>
                                <p className="text-sm text-gray-500">Add a new employee or generate mock data to get started.</p>
                           </div>
                        </td>
                    </tr>
                    ) : (
                    filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-sm border border-green-200">
                                {emp.name ? String(emp.name).charAt(0) : '?'}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {emp.email}
                                </div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                {emp.role}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {emp.department}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${emp.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                emp.status === 'Inactive' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                            {emp.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                onClick={() => handleEdit(emp)}
                                className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Edit"
                                >
                                <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                onClick={() => handleDelete(emp.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                                >
                                <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            {filteredEmployees.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing {filteredEmployees.length} record(s)</span>
                    <span>Database: Google Sheets</span>
                </div>
            )}
            </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                            required
                            type="text"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                            required
                            type="text"
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900"
                        />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors flex items-center"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
