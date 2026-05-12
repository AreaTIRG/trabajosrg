import { Link } from 'react-router-dom';
import { Job } from '../api/endpoints';

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-brand-accent/30 transition group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-navy transition">{job.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-brand-navy/10 text-brand-navy px-2.5 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {job.zone}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{job.location}</span>
            )}
            {job.job_type && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{job.job_type}</span>
            )}
          </div>
          {job.requirements && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">{job.requirements}</p>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-accent transition flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
      </div>
    </Link>
  );
}
