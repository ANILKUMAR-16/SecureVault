import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, Trash2, Clock, CheckCircle } from 'lucide-react';
import { formatBytes, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalSize: 0,
    downloads: 0
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // For a regular user, we derive stats from their documents list
      const res = await api.get('/documents/?limit=5&sort_by=newest');
      const allDocsRes = await api.get('/documents/?limit=100'); // simple hack to get stats
      
      const docs = allDocsRes.data.items;
      setStats({
        totalDocs: docs.length,
        totalSize: docs.reduce((acc, curr) => acc + curr.size, 0),
        downloads: docs.reduce((acc, curr) => acc + curr.downloads, 0)
      });
      setRecentDocs(res.data.items);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-blue-50 text-brand-600 mr-4">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Documents</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalDocs}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
            <Download className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Downloads</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.downloads}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Storage Used</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatBytes(stats.totalSize)}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity / Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Recently Uploaded</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentDocs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No documents uploaded yet.</div>
          ) : (
            recentDocs.map(doc => (
              <div key={doc.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="font-medium text-slate-800">{doc.filename}</p>
                    <p className="text-xs text-slate-500">{formatBytes(doc.size)} • {doc.extension.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(doc.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const Database = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
)
