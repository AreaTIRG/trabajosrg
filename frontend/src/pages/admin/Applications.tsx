import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApplications, getAdminJobs, updateApplicationStatus, Application, Job } from '../../api/endpoints';
import StatusBadge from '../../components/StatusBadge';

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', job_id: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      getApplications({
        status: filters.status || undefined,
        job_id: filters.job_id || undefined,
      }),
      getAdminJobs('PUBLISHED'),
    ])
      .then(([appsRes, jobsRes]) => {
        setApps(appsRes.data);
        setJobs(jobsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters]);

  const handleStatus = async (id: string, status: string) => {
    await updateApplicationStatus(id, status);
    load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-navy">Postulaciones</h1>
        <p className="text-gray-500 text-sm mt-1">Revisa y gestiona las postulaciones recibidas</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none">
          <option value="">Todos los estados</option>
          <option value="NEW">Nuevo</option>
          <option value="REVIEWING">Revisando</option>
          <option value="INTERVIEWING">Entrevistando</option>
          <option value="HIRED">Contratado</option>
          <option value="REJECTED">Rechazado</option>
        </select>
        <select value={filters.job_id} onChange={(e) => setFilters({ ...filters, job_id: e.target.value })} className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none">
          <option value="">Todas las vacantes</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p className="text-gray-400">No hay postulaciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-4">Candidato</th>
                <th className="px-5 py-4">Vacante</th>
                <th className="px-5 py-4">Zona</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <Link to={`/admin/candidates/${app.candidate_id}`} className="text-brand-navy hover:text-brand-navy-light font-medium">
                      {app.candidate_name}
                    </Link>
                    <div className="text-gray-400 text-xs mt-0.5">{app.candidate_email}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{app.job_title}</td>
                  <td className="px-5 py-4 text-gray-500">{app.job_zone}</td>
                  <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                  <td className="px-5 py-4 text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatus(app.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none"
                    >
                      <option value="NEW">Nuevo</option>
                      <option value="REVIEWING">Revisando</option>
                      <option value="INTERVIEWING">Entrevistando</option>
                      <option value="HIRED">Contratado</option>
                      <option value="REJECTED">Rechazado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
