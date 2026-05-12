import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicJob, Job } from '../../api/endpoints';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPublicJob(id)
      .then((res) => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
      <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 font-medium">Vacante no encontrada</p>
      <Link to="/" className="text-brand-navy hover:text-brand-navy-light mt-4 inline-block">Volver a vacantes</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-navy-light mb-6 text-sm font-medium transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Todas las vacantes
      </Link>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-brand-navy px-8 py-6">
          <h1 className="text-2xl font-bold text-white">{job.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/15 text-white/90 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {job.zone}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/15 text-white/90 px-3 py-1.5 rounded-full">{job.location}</span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/15 text-white/90 px-3 py-1.5 rounded-full">{job.job_type}</span>
            )}
          </div>
        </div>
        <div className="p-8">
          {job.requirements && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Requisitos
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-400">Publicado: {new Date(job.created_at).toLocaleDateString()}</p>
            <Link
              to={`/apply/${job.id}`}
              className="inline-flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-accent-light transition shadow-lg shadow-brand-accent/20"
            >
              Postular ahora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
