// Choices for projects and tasks, with their colours (shared by server and client code).

export const PROJECT_TYPES = ["Web App", "Mobile App", "AI Model/Integration", "Custom Software", "Maintenance"] as const;
export const PROJECT_STATUSES = ["Not Started", "In Progress", "Testing", "Completed", "On Hold"] as const;
export const HOSTINGS = ["Google Cloud", "Vercel", "Firebase", "Other"] as const;
export const AUTH_PROVIDERS = ["Neon", "Supabase", "Google Auth", "Custom"] as const;
export const DEPLOYMENTS = ["Github Actions", "Vercel Deployment", "Custom", "App Store Connect / Play Console"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_TONE: Record<ProjectStatus, string> = {
  "Not Started": "slate", "In Progress": "blue", Testing: "violet", Completed: "green", "On Hold": "amber",
};

export const TASK_STATUSES = ["pending", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = { pending: "Pending", in_progress: "In progress", done: "Done" };

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };
