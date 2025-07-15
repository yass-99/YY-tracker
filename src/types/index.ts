export interface WorkoutSession {
  id: string;
  date: string;
  type: 'musculation' | 'athletisme' | 'basket';
  duration: number; // in minutes
  exercises: Exercise[];
  notes?: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
  time?: number;
  notes?: string;
}

export interface AthleticTest {
  id: string;
  date: string;
  type: 'detente_cmj' | 'detente_squat' | 'sprint_10m' | 'sprint_20m' | 'sprint_40m' | 'broad_jump' | 'triple_jump' | 'gainage_static' | 'gainage_dynamic';
  value: number;
  unit: string;
  notes?: string;
}

export interface ShootingSession {
  id: string;
  date: string;
  zones: ShootingZone[];
  totalAttempts: number;
  totalMakes: number;
  percentage: number;
}

export interface ShootingZone {
  zone: string;
  attempts: number;
  makes: number;
  percentage: number;
}

export interface AIInsight {
  id: string;
  date: string;
  type: 'recommendation' | 'alert' | 'achievement';
  category: 'musculation' | 'athletisme' | 'basket' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
}