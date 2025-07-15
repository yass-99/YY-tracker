import { WorkoutSession, AthleticTest, ShootingSession, AIInsight } from '../types';

const STORAGE_KEYS = {
  WORKOUTS: 'fitness_tracker_workouts',
  ATHLETIC_TESTS: 'fitness_tracker_athletic_tests',
  SHOOTING_SESSIONS: 'fitness_tracker_shooting_sessions',
  AI_INSIGHTS: 'fitness_tracker_ai_insights'
};

export const storage = {
  // Workouts
  saveWorkout: (workout: WorkoutSession) => {
    const workouts = storage.getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  getWorkouts: (): WorkoutSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  },

  deleteWorkout: (id: string) => {
    const workouts = storage.getWorkouts().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  // Athletic Tests
  saveAthleticTest: (test: AthleticTest) => {
    const tests = storage.getAthleticTests();
    const existingIndex = tests.findIndex(t => t.id === test.id);
    
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    
    localStorage.setItem(STORAGE_KEYS.ATHLETIC_TESTS, JSON.stringify(tests));
  },

  getAthleticTests: (): AthleticTest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATHLETIC_TESTS);
    return data ? JSON.parse(data) : [];
  },

  deleteAthleticTest: (id: string) => {
    const tests = storage.getAthleticTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.ATHLETIC_TESTS, JSON.stringify(tests));
  },

  // Shooting Sessions
  saveShootingSession: (session: ShootingSession) => {
    const sessions = storage.getShootingSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEYS.SHOOTING_SESSIONS, JSON.stringify(sessions));
  },

  getShootingSessions: (): ShootingSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SHOOTING_SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  deleteShootingSession: (id: string) => {
    const sessions = storage.getShootingSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHOOTING_SESSIONS, JSON.stringify(sessions));
  },

  // AI Insights
  saveAIInsight: (insight: AIInsight) => {
    const insights = storage.getAIInsights();
    insights.push(insight);
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
  },

  getAIInsights: (): AIInsight[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
    return data ? JSON.parse(data) : [];
  },

  clearAIInsights: () => {
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify([]));
  }
};