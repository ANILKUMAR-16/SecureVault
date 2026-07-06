import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, Database, Download, Trash2, Activity, ShieldAlert, Clock } from 'lucide-react';
import { formatBytes, formatDate } from '../utils/helpers';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard'); // Kick out non-admins
      return;
    }
    
    if (activeTab === 'overview') fetchAnalytics();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs?limit=100');
      setAuditLogs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const renderOverview = () => {
    if (loading || !analytics) return <div className="p-8 text-slate-500">Loading analytics...</div>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-800">{analytics.total_users}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4"><FileText className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Documents</p>
            <h3 className="text-2xl font-bold text-slate-800">{analytics.total_documents}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4"><Database className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Storage Used</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatBytes(analytics.storage_used_bytes)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4"><Activity className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Uploads</p>
            <h3 className="text-2xl font-bold text-slate-800">{analytics.todays_uploads}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 mr-4"><Download className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Downloads</p>
            <h3 className="text-2xl font-bold text-slate-800">{analytics.total_downloads}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-red-50 text-red-600 mr-4"><Trash2 className="w-8 h-8" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recycle Bin Items</p>
            <h3 className="text-2xl font-bold text-slate-800">{analytics.recycle_bin_count}</h3>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (loading) return <div className="p-8 text-slate-500">Loading users...</div>;
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usersList.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{u.name}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLogs = () => {
    if (loading) return <div className="p-8 text-slate-500">Loading logs...</div>;
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-4 font-medium">Timestamp</th>
              <th className="p-4 font-medium">User ID</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-500 text-sm whitespace-nowrap"><Clock className="w-4 h-4 inline mr-1"/>{formatDate(log.timestamp)}</td>
                <td className="p-4 text-slate-600 text-sm font-mono">{log.user_id.split('-')[0]}...</td>
                <td className="p-4 text-slate-800 font-medium">{log.action}</td>
                <td className="p-4 text-slate-600 text-sm">{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          System Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'logs' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Audit Logs
        </button>
      </div>

      <div className="animate-fade-in-up">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
}
