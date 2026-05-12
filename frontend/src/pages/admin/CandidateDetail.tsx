import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCandidate, Candidate } from '../../api/endpoints';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!id) return;
    getCandidate(id).then((res) => setCandidate(res.data));
  }, [id]);

  if (!candidate) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Link to="/admin/applications" className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-navy-light mb-6 text-sm font-medium transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Volver a postulaciones
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-navy">Candidato</h1>
        <p className="text-gray-500 text-sm mt-1">Información del postulante</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-brand-navy/10 rounded-2xl flex items-center justify-center text-brand-navy font-bold text-xl">
            {candidate.first_name?.charAt(0)}{candidate.last_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{candidate.first_name} {candidate.last_name}</h2>
            <p className="text-gray-500 text-sm">{candidate.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</span>
            <p className="mt-1 font-medium text-gray-900">{candidate.phone || '-'}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Registrado</span>
            <p className="mt-1 font-medium text-gray-900">{new Date(candidate.created_at).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Curriculum Vitae</span>
            {candidate.cv_url ? (
              candidate.cv_type === 'file' ? (
                <a href={candidate.cv_url} target="_blank" download className="mt-1 inline-flex items-center gap-2 text-brand-navy hover:text-brand-navy-light font-medium transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Descargar CV (PDF)
                </a>
              ) : (
                <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 text-brand-navy hover:text-brand-navy-light font-medium transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  Ver CV online
                </a>
              )
            ) : (
              <p className="mt-1 font-medium text-gray-500">-</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
