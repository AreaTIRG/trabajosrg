import { useState, useEffect } from 'react';
import { getPublicJobs, getZones, Job } from '../../api/endpoints';
import JobCard from '../../components/JobCard';

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getZones().then((res) => setZones(res.data.zones)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublicJobs(selectedZone || undefined)
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  }, [selectedZone]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-navy">Trabaja con Nosotros</h1>
        <p className="mt-3 text-gray-500 text-lg">Explora las vacantes disponibles y sé parte de Ramirez Group</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none appearance-none"
          >
            <option value="">Todas las zonas</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <p className="text-sm text-gray-400">{loading ? '...' : `${jobs.length} vacante${jobs.length !== 1 ? 's' : ''}`}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <h3 className="text-lg font-semibold text-gray-400 mb-1">No hay vacantes disponibles</h3>
          <p className="text-sm text-gray-400">Actualmente no tenemos ofertas abiertas. Vuelve a consultar pronto.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
