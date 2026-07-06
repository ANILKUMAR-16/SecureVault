import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatBytes, formatDate } from '../utils/helpers';
import { FileText, Search, Download, Trash2, Eye, Filter, ArrowUpDown } from 'lucide-react';
import UploadModal from '../components/UploadModal';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchDocuments();
  }, [page, sortBy]); // Removed search from deps to handle via form submit

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/documents/?page=${page}&limit=${limit}&sort_by=${sortBy}&search=${search}`);
      setDocuments(res.data.items);
      setTotalPages(Math.ceil(res.data.total / limit));
    } catch (error) {
      console.error("Error fetching documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDocuments();
  };

  const handleDownload = async (docId, filename) => {
    try {
      const res = await api.get(`/documents/download/${docId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      // Refresh to update download count
      fetchDocuments();
    } catch (error) {
      console.error("Error downloading document", error);
      alert("Failed to download file.");
    }
  };

  const handlePreview = async (docId) => {
  try {
    const res = await api.get(`/documents/preview/${docId}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    alert("Failed to preview file.");
  }
};

  const handleDelete = async (docId) => {
    if (window.confirm("Move this file to the Recycle Bin?")) {
      try {
        await api.delete(`/documents/${docId}`);
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search files by name or extension..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        </form>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <select 
            className="input-field bg-white w-full sm:w-40"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
            <option value="largest">Largest File</option>
            <option value="smallest">Smallest File</option>
          </select>
          <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary whitespace-nowrap">
            Upload File
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium hidden md:table-cell">Uploaded</th>
                <th className="p-4 font-medium text-center">Downloads</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading documents...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No documents found.</td></tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 flex items-center">
                      <FileText className="w-5 h-5 text-brand-500 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800">{doc.filename}</p>
                        <p className="text-xs text-slate-500 uppercase">{doc.extension.replace('.', '')}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatBytes(doc.size)}</td>
                    <td className="p-4 text-sm text-slate-600 hidden md:table-cell">{formatDate(doc.created_at)}</td>
                    <td className="p-4 text-sm text-slate-600 text-center">{doc.downloads}</td>
                    <td className="p-4 text-right space-x-2">
                      {['.pdf', '.png', '.jpg', '.jpeg'].includes(doc.extension) && (
                        <button onClick={() => handlePreview(doc.id)} className="p-2 text-slate-400 hover:text-brand-600 bg-white rounded-lg border border-slate-200 hover:border-brand-200 transition-colors inline-block" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDownload(doc.id, doc.filename)} className="p-2 text-slate-400 hover:text-green-600 bg-white rounded-lg border border-slate-200 hover:border-green-200 transition-colors inline-block" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200 hover:border-red-200 transition-colors inline-block" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <div className="space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={() => { setPage(1); fetchDocuments(); }} 
      />
    </div>
  );
}
