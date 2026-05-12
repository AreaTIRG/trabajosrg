import client from './client';

export interface Job {
  id: string;
  title: string;
  zone: string;
  location: string | null;
  job_type: string | null;
  requirements: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_posting_id: string;
  candidate_id: string;
  status: string;
  internal_notes: string | null;
  applied_at: string;
  job_title?: string;
  job_zone?: string;
  candidate_name?: string;
  candidate_email?: string;
}

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cv_type: string | null;
  cv_url: string | null;
  created_at: string;
}

export const getPublicJobs = (zone?: string) =>
  client.get<Job[]>('/jobs', { params: { zone } });

export const getPublicJob = (id: string) =>
  client.get<Job>(`/jobs/${id}`);

export const applyToJob = (formData: FormData) =>
  client.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const login = (email: string, password: string) =>
  client.post<{ access_token: string; token_type: string }>('/auth/login', { email, password });

export const getZones = () =>
  client.get<{ zones: string[] }>('/zones');

export const getAdminJobs = (status?: string) =>
  client.get<Job[]>('/admin/jobs', { params: { status } });

export const getAdminJob = (id: string) =>
  client.get<Job>(`/admin/jobs/${id}`);

export const createJob = (data: Partial<Job>) =>
  client.post<Job>('/admin/jobs', data);

export const updateJob = (id: string, data: Partial<Job>) =>
  client.put<Job>(`/admin/jobs/${id}`, data);

export const updateJobStatus = (id: string, status: string) =>
  client.patch<Job>(`/admin/jobs/${id}/status`, { status });

export const deleteJob = (id: string) =>
  client.delete(`/admin/jobs/${id}`);

export const getApplications = (params?: { status?: string; job_id?: string; zone?: string }) =>
  client.get<Application[]>('/admin/applications', { params });

export const updateApplicationStatus = (id: string, status: string) =>
  client.patch(`/admin/applications/${id}/status`, { status });

export const updateApplicationNotes = (id: string, notes: string) =>
  client.patch(`/admin/applications/${id}/notes`, { internal_notes: notes });

export const getCandidate = (id: string) =>
  client.get<Candidate>(`/admin/candidates/${id}`);

export const getMe = () =>
  client.get<{ id: string; email: string; name: string }>('/admin/me');
