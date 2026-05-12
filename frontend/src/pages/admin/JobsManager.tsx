import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminJobs, updateJobStatus, deleteJob, Job } from '../../api/endpoints';
import StatusBadge from '../../components/StatusBadge';

export default function JobsManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadJobs = () => {
    setLoading(true);
    getAdminJobs(filter || undefined)
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    await updateJobStatus(id, status);
    loadJobs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta vacante? Solo borradores pueden eliminarse.')) return;
    await deleteJob(id);
    loadJobs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Vacantes</h1>
          <p className="text-gray-500 text-sm mt-1">Administra las ofertas laborales</p>
        </div>
        <Link to="/admin/jobs/new" className="bg-brand-navy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-navy-light transition flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Nueva Vacante
        </Link>
      </div>

      <div className="mb-6">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none">
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="PAUSED">Pausado</option>
          <option value="CLOSED">Cerrado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <p className="text-gray-400">No hay vacantes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-4">Título</th>
                <th className="px-5 py-4">Zona</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Creado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4 font-medium text-gray-900">{job.title}</td>
                  <td className="px-5 py-4 text-gray-500">{job.zone}</td>
                  <td className="px-5 py-4"><StatusBadge status={job.status} /></td>
                  <td className="px-5 py-4 text-gray-500">{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/jobs/${job.id}/edit`} className="text-brand-navy hover:text-brand-navy-light text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-navy/5 transition">Editar</Link>
                      {job.status === 'DRAFT' && (
                        <button onClick={() => handleStatus(job.id, 'PUBLISHED')} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition">Publicar</button>
                      )}
                      {job.status === 'PUBLISHED' && (
                        <button onClick={() => handleStatus(job.id, 'PAUSED')} className="text-amber-600 hover:text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition">Pausar</button>
                      )}
                      {(job.status === 'PUBLISHED' || job.status === 'PAUSED') && (
                        <button onClick={() => handleStatus(job.id, 'CLOSED')} className="text-red-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Cerrar</button>
                      )}
                      {job.status === 'DRAFT' && (
                        <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Eliminar</button>
                      )}
                    </div>
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
