import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Activity,
  Timer,
  Zap
} from 'lucide-react';
import { storage } from '../utils/storage';
import { WorkoutSession, AthleticTest, ShootingSession } from '../types';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [athleticTests, setAthleticTests] = useState<AthleticTest[]>([]);
  const [shootingSessions, setShootingSessions] = useState<ShootingSession[]>([]);

  useEffect(() => {
    setWorkouts(storage.getWorkouts());
    setAthleticTests(storage.getAthleticTests());
    setShootingSessions(storage.getShootingSessions());
  }, []);

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyWorkouts = workouts.filter(workout => 
      isWithinInterval(new Date(workout.date), { start: weekStart, end: weekEnd })
    );

    const totalDuration = weeklyWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    const workoutsByType = weeklyWorkouts.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWorkouts: weeklyWorkouts.length,
      totalDuration,
      workoutsByType
    };
  };

  const getLatestTests = () => {
    const sortedTests = [...athleticTests].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedTests.slice(0, 5);
  };

  const getShootingAverage = () => {
    if (shootingSessions.length === 0) return 0;
    const totalPercentage = shootingSessions.reduce((sum, session) => sum + session.percentage, 0);
    return Math.round(totalPercentage / shootingSessions.length);
  };

  const weeklyStats = getWeeklyStats();
  const latestTests = getLatestTests();
  const shootingAverage = getShootingAverage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-2">
          Bienvenue sur SportTracker Pro
        </h2>
        <p className="text-blue-100">
          Tableau de bord de vos performances sportives
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Séances cette semaine</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalWorkouts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps total</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalDuration}min</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Timer className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Tir moyen</p>
              <p className="text-2xl font-bold text-gray-900">{shootingAverage}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests récents</p>
              <p className="text-2xl font-bold text-gray-900">{latestTests.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Séances récentes
          </h3>
          <div className="space-y-3">
            {workouts.slice(-5).reverse().map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{workout.type}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(workout.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{workout.duration}min</p>
                  <p className="text-xs text-gray-500">{workout.exercises.length} exercices</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Athletic Tests */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            Tests athlétiques récents
          </h3>
          <div className="space-y-3">
            {latestTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {test.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(test.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {test.value} {test.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-green-600" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
            <div className="text-center">
              <div className="bg-blue-600 p-3 rounded-full inline-block mb-2">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-blue-900">Nouvelle séance</p>
              <p className="text-sm text-blue-600">Enregistrer un entraînement</p>
            </div>
          </button>
          
          <button className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            <div className="text-center">
              <div className="bg-orange-600 p-3 rounded-full inline-block mb-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-orange-900">Test athlétique</p>
              <p className="text-sm text-orange-600">Mesurer une performance</p>
            </div>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            <div className="text-center">
              <div className="bg-green-600 p-3 rounded-full inline-block mb-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-green-900">Session de tir</p>
              <p className="text-sm text-green-600">Enregistrer les tirs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;