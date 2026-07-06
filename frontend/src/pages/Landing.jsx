import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileSearch, Database } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 lg:px-12 bg-white shadow-sm">
        <div className="flex items-center space-x-2 text-brand-600">
          <Shield className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">SecureVault</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="font-medium text-slate-600 hover:text-brand-600 transition-colors">Log In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-8 animate-fade-in-up">
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            Enterprise-Grade <span className="text-brand-600">Document Management</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600">
            Securely upload, organize, manage and share your sensitive documents with our robust, encrypted cloud infrastructure.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">Start for Free</Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">Learn More</a>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 px-6 lg:px-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why SecureVault?</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Everything you need to manage your organization's files securely and efficiently.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <Lock className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Military-Grade Security</h3>
              <p className="text-slate-600">JWT Authentication, robust RBAC, and strict file validation to keep malware out.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <Database className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Soft Deletes</h3>
              <p className="text-slate-600">Never lose a file accidentally. Restore deleted documents easily from the Recycle Bin.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <FileSearch className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
              <p className="text-slate-600">Find exactly what you need with powerful sorting, pagination, and metadata search.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <Shield className="w-10 h-10 text-brand-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Full Audit Trail</h3>
              <p className="text-slate-600">Admins can track every login, upload, and download for complete compliance.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} SecureVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
