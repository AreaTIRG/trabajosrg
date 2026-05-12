import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applyToJob } from '../../api/endpoints';

export default function ApplyForm() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cv_link: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [cvMethod, setCvMethod] = useState<'file' | 'link'>('file');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const fd = new FormData();
    fd.append('job_posting_id', jobId!);
    fd.append('first_name', form.first_name);
    fd.append('last_name', form.last_name);
    fd.append('email', form.email);
    if (form.phone) fd.append('phone', form.phone);

    if (cvMethod === 'file' && file) {
      fd.append('cv_file', file);
    } else if (cvMethod === 'link' && form.cv_link) {
      fd.append('cv_link', form.cv_link);
    }

    try {
      await applyToJob(fd);
      navigate('/?applied=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al postular');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1 text-brand-navy hover:text-brand-navy-light text-sm font-medium transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Volver a la vacante
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Postular a la vacante</h1>
          <p className="text-gray-500 text-sm mt-1">Completa tus datos para postular</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
                placeholder="Nombres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido *</label>
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
                placeholder="Apellidos"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              placeholder="+51 999 999 999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Curriculum Vitae</label>
            <div className="flex gap-4 mb-4">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition ${
                cvMethod === 'file' ? 'border-brand-accent bg-brand-accent/5 text-brand-navy' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
                <input type="radio" checked={cvMethod === 'file'} onChange={() => setCvMethod('file')} className="sr-only" />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Subir archivo
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition ${
                cvMethod === 'link' ? 'border-brand-accent bg-brand-accent/5 text-brand-navy' : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
                <input type="radio" checked={cvMethod === 'link'} onChange={() => setCvMethod('link')} className="sr-only" />
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                Link (Drive/LinkedIn)
              </label>
            </div>
            {cvMethod === 'file' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-accent/50 transition cursor-pointer" onClick={() => document.getElementById('cv-file')?.click()}>
                <input id="cv-file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                {file ? (
                  <p className="text-sm text-brand-navy font-medium">{file.name}</p>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <p className="text-sm text-gray-500">Haz clic para seleccionar o arrastra tu CV aquí</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</p>
                  </>
                )}
              </div>
            ) : (
              <input
                placeholder="https://drive.google.com/..."
                value={form.cv_link}
                onChange={(e) => setForm({ ...form, cv_link: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-accent text-white py-3 rounded-xl font-semibold hover:bg-brand-accent-light transition disabled:opacity-50 shadow-lg shadow-brand-accent/20"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </span>
            ) : 'Enviar postulación'}
          </button>
        </form>
      </div>
    </div>
  );
}
