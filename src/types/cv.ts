export interface CVContact {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
  location: string;
}

export interface CVEducation {
  institution: string;
  degree: string;
  dates: string;
  subtitle?: string | null;
  details: string[];
}

export interface CVProject {
  title: string;
  role: string;
  dates: string;
  subtitle?: string;
  bullets: string[];
}

export interface CVExperience {
  company: string;
  role: string;
  dates: string;
  location?: string;
  bullets: string[];
}

export interface CVExtracurricular {
  organization: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface CVCertification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface CVData {
  contact: CVContact;
  summary: string;
  education: CVEducation[];
  projects: CVProject[];
  experience: CVExperience[];
  skills: Record<string, string>;
  extracurricular: CVExtracurricular[];
  certifications: CVCertification[];
}
