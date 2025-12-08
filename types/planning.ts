export type ProjectType =
  | 'e-commerce'
  | 'saas'
  | 'blog'
  | 'portfolio'
  | 'dashboard'
  | 'api'
  | 'documentation'
  | 'marketing'
  | 'custom';

export type ProjectScale = 'small' | 'medium' | 'large' | 'enterprise';

export type PlanningPhase =
  | 'initialization'
  | 'requirements'
  | 'architecture'
  | 'setup'
  | 'development'
  | 'testing'
  | 'deployment';

export type ChecklistItem = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  notes?: string;
  completedAt?: string;
};

export type ChecklistCategory = {
  [itemId: string]: ChecklistItem;
};

export type PlanningChecklist = {
  'Project Setup': ChecklistCategory;
  Architecture: ChecklistCategory;
  Features: ChecklistCategory;
  Testing: ChecklistCategory;
  Deployment: ChecklistCategory;
};

export type ArchitectureDecision = {
  id: string;
  category: string;
  decision: string;
  rationale: string;
  alternatives?: string[];
  createdAt: string;
};

export type PlanningSession = {
  id: string;
  projectName: string;
  projectType: ProjectType;
  scale: ProjectScale;
  features: string[];
  phase: PlanningPhase;
  startedAt: string;
  updatedAt: string;
  checklist: PlanningChecklist;
  architectureDecisions: ArchitectureDecision[];
};

export type ArchitecturePattern = {
  name: string;
  description: string;
  useCases: string[];
  technologies: string[];
  complexity: 'low' | 'medium' | 'high';
  scalability: 'low' | 'medium' | 'high';
  maintainability: 'low' | 'medium' | 'high';
};

export type PlanningTemplate = {
  name: string;
  projectType: ProjectType;
  description: string;
  recommendedFeatures: string[];
  architecturePatterns: string[];
  estimatedTimeline: string;
};
