import { WorkoutSession, AthleticTest, ShootingSession, AIInsight } from '../types';

const getKeys = (user: string) => ({
  WORKOUTS: `fitness_tracker_${user}_workouts`,
  ATHLETIC_TESTS: `fitness_tracker_${user}_athletic_tests`,
  SHOOTING_SESSIONS: `fitness_tracker_${user}_shooting_sessions`,
  AI_INSIGHTS: `fitness_tracker_${user}_ai_insights`
});

export const createStorage = (user: string) => {
  const STORAGE_KEYS = getKeys(user);

  const getWorkouts = (): WorkoutSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  };

  const saveWorkout = (workout: WorkoutSession) => {
    const workouts = getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  };

  const deleteWorkout = (id: string) => {
    const workouts = getWorkouts().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  };

  const getAthleticTests = (): AthleticTest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATHLETIC_TESTS);
    return data ? JSON.parse(data) : [];
  };

  const saveAthleticTest = (test: AthleticTest) => {
    const tests = getAthleticTests();
    const existingIndex = tests.findIndex(t => t.id === test.id);
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    localStorage.setItem(STORAGE_KEYS.ATHLETIC_TESTS, JSON.stringify(tests));
  };

  const deleteAthleticTest = (id: string) => {
    const tests = getAthleticTests().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.ATHLETIC_TESTS, JSON.stringify(tests));
  };

  const getShootingSessions = (): ShootingSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SHOOTING_SESSIONS);
    return data ? JSON.parse(data) : [];
  };

  const saveShootingSession = (session: ShootingSession) => {
    const sessions = getShootingSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.SHOOTING_SESSIONS, JSON.stringify(sessions));
  };

  const deleteShootingSession = (id: string) => {
    const sessions = getShootingSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHOOTING_SESSIONS, JSON.stringify(sessions));
  };

  const getAIInsights = (): AIInsight[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
    return data ? JSON.parse(data) : [];
  };

  const saveAIInsight = (insight: AIInsight) => {
    const insights = getAIInsights();
    insights.push(insight);
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
  };

  const clearAIInsights = () => {
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify([]));
  };

  return {
    saveWorkout,
    getWorkouts,
    deleteWorkout,
    saveAthleticTest,
    getAthleticTests,
    deleteAthleticTest,
    saveShootingSession,
    getShootingSessions,
    deleteShootingSession,
    saveAIInsight,
    getAIInsights,
    clearAIInsights
  };
};

// Default storage for backward compatibility
export const storage = createStorage('default');
