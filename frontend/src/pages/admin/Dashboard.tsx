import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminJobs, getApplications, Job, Application } from '../../api/endpoints';

export default function Dashboard() {
  const [jobCount, setJobCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [newApps, setNewApps] = useState(0);

  useEffect(() => {
    getAdminJobs().then((res) => {
      setJobCount(res.data.length);
      setPublishedCount(res.data.filter((j: Job) => j.status === 'PUBLISHED').length);
    });
    getApplications({ status: 'NEW' }).then((res) => setNewApps(res.data.length));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del panel de administración</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="w-10 h-10 bg-brand-navy/10 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <p className="text-gray-500 text-sm">Total Vacantes</p>
          <p className="text-3xl font-bold text-brand-navy mt-1">{jobCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p className="text-gray-500 text-sm">Publicadas</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
        </div>
        <Link to="/admin/applications" className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-brand-accent/30 transition group">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p className="text-gray-500 text-sm">Postulaciones Nuevas</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{newApps}</p>
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/jobs" className="bg-brand-navy text-white p-6 rounded-2xl text-center font-medium hover:bg-brand-navy-light transition flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Gestionar Vacantes
        </Link>
        <Link to="/admin/applications" className="bg-brand-accent text-white p-6 rounded-2xl text-center font-medium hover:bg-brand-accent-light transition flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Revisar Postulaciones
        </Link>
      </div>
    </div>
  );
}
