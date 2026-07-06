import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatBytes, formatDate } from '../utils/helpers';
import { FileText, RotateCcw, Trash2 } from 'lucide-react';

export default function RecycleBin() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedDocuments();
  }, []);

  // We fetch all documents but filter deleted ones on the backend by passing `include_deleted` param?
  // Our current backend `crud_document.get_documents` accepts `include_deleted=False` by default.
  // Wait, we need an endpoint or to modify the search to only get deleted items.
  // Actually, we can fetch all with a special flag, or just use the `/documents/?include_deleted=true` and filter on frontend for now.
  // Let's modify the request to ask for deleted files. For simplicity, since we didn't expose `include_deleted` explicitly in the router to just return ONLY deleted files,
  // Let's fetch the data and filter out `is_deleted === true`.
  // Ideally this would be a dedicated backend query `is_deleted == True`.

  const fetchDeletedDocuments = async () => {
    setLoading(true);
    try {
      // Temporary hack for Phase 1: Fetch documents (Wait, backend defaults to is_deleted=False)
      // I realize our backend router `GET /documents/` doesn't allow fetching deleted ones. 
      // I will need to update the backend router to accept `deleted_only` param. 
      // For now I will mock the list or fetch all if I update the backend.
      // Wait, let's update the backend router to accept `deleted: bool = False`.
      const res = await api.get(`/documents/?deleted_only=true`);
      setDocuments(res.data.items || []);
    } catch (error) {
      console.error("Error fetching recycle bin", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (docId) => {
    try {
      await api.post(`/documents/restore/${docId}`);
      fetchDeletedDocuments();
    } catch (error) {
      console.error("Error restoring document", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center text-slate-800">
          <Trash2 className="w-5 h-5 text-slate-400 mr-2" />
          <h3 className="font-semibold text-lg">Recycle Bin</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium hidden md:table-cell">Deleted On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading recycle bin...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Recycle bin is empty.</td></tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center opacity-60">
                      <FileText className="w-5 h-5 text-slate-400 mr-3" />
                      <div>
                        <p className="font-medium text-slate-800 line-through">{doc.filename}</p>
                        <p className="text-xs text-slate-500 uppercase">{doc.extension.replace('.', '')}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatBytes(doc.size)}</td>
                    <td className="p-4 text-sm text-slate-600 hidden md:table-cell">Recent</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleRestore(doc.id)} className="p-2 text-slate-400 hover:text-brand-600 bg-white rounded-lg border border-slate-200 hover:border-brand-200 transition-colors inline-flex items-center text-sm font-medium" title="Restore">
                        <RotateCcw className="w-4 h-4 mr-1" /> Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
