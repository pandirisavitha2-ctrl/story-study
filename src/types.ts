export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  type: 'study' | 'practice' | 'exam';
}

export interface StudySession {
  id: string;
  subject: string;
  date: string;
  time: string;
  location: string;
  classmates: string[];
}

export interface UserProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  upcomingExams: { subject: string; date: string }[];
  learningStyle?: 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic';
}
