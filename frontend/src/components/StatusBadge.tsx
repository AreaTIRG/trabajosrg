const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  CLOSED: 'bg-red-50 text-red-700',
  NEW: 'bg-blue-50 text-blue-700',
  REVIEWING: 'bg-purple-50 text-purple-700',
  INTERVIEWING: 'bg-indigo-50 text-indigo-700',
  HIRED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  PAUSED: 'Pausado',
  CLOSED: 'Cerrado',
  NEW: 'Nuevo',
  REVIEWING: 'Revisando',
  INTERVIEWING: 'Entrevistando',
  HIRED: 'Contratado',
  REJECTED: 'Rechazado',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'PUBLISHED' || status === 'HIRED' ? 'bg-emerald-500' :
        status === 'DRAFT' ? 'bg-gray-400' :
        status === 'PAUSED' ? 'bg-amber-500' :
        status === 'NEW' ? 'bg-blue-500' :
        status === 'REVIEWING' ? 'bg-purple-500' :
        status === 'INTERVIEWING' ? 'bg-indigo-500' :
        'bg-red-500'
      }`} />
      {statusLabels[status] || status}
    </span>
  );
}
