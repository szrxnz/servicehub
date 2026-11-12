export const JOB_STATUSES = ["Pending", "In Progress", "Done"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_URGENCIES = ["normal", "urgent"] as const;
export type JobUrgency = (typeof JOB_URGENCIES)[number];

export type Job = {
  id: string;
  customer: string;
  machine: string;
  error_code: string | null;
  issue: string;
  urgency: JobUrgency;
  status: JobStatus;
  tech: string | null;
  created_at: string;
};

export type KnowledgeItem = {
  id: string;
  machine_model: string;
  error_code: string | null;
  symptom: string;
  solution: string;
  created_at: string;
};
