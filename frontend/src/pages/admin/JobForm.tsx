import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminJob, createJob, updateJob, getZones } from '../../api/endpoints';

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [zones, setZones] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    zone: '',
    location: '',
    job_type: '',
    requirements: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getZones().then((res) => setZones(res.data.zones));
    if (id) {
      getAdminJob(id).then((res) => {
        const j = res.data;
        setForm({ title: j.title, zone: j.zone, location: j.location || '', job_type: j.job_type || '', requirements: j.requirements || '' });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateJob(id!, form);
      } else {
        await createJob(form);
      }
      navigate('/admin/jobs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-navy">{isEdit ? 'Editar Vacante' : 'Nueva Vacante'}</h1>
        <p className="text-gray-500 text-sm mt-1">{isEdit ? 'Actualiza los datos de la vacante' : 'Crea una nueva oferta laboral'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              placeholder="Ej: Ingeniero Civil"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Zona *</label>
            <select
              required
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition bg-white"
            >
              <option value="">Seleccionar zona</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicación</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              placeholder="Ej: Lima, Perú"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
            <input
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition"
              placeholder="Tiempo Completo / Medio Tiempo"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Requisitos</label>
          <textarea
            rows={6}
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent outline-none transition resize-none"
            placeholder="Describe los requisitos y responsabilidades del puesto..."
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-navy text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-navy-light transition disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : isEdit ? 'Actualizar Vacante' : 'Crear Vacante'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/jobs')}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
