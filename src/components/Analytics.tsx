import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { storage } from '../utils/storage';
import { WorkoutSession, AthleticTest, ShootingSession } from '../types';
import { ATHLETIC_TESTS, SHOOTING_ZONES, WORKOUT_TYPES } from '../utils/constants';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [athleticTests, setAthleticTests] = useState<AthleticTest[]>([]);
  const [shootingSessions, setShootingSessions] = useState<ShootingSession[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    setWorkouts(storage.getWorkouts());
    setAthleticTests(storage.getAthleticTests());
    setShootingSessions(storage.getShootingSessions());
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = subDays(now, days);

    return {
      workouts: workouts.filter(w => new Date(w.date) >= startDate),
      athleticTests: athleticTests.filter(t => new Date(t.date) >= startDate),
      shootingSessions: shootingSessions.filter(s => new Date(s.date) >= startDate)
    };
  };

  const filteredData = getFilteredData();

  // Workout Distribution Chart
  const getWorkoutDistribution = () => {
    const distribution = filteredData.workouts.reduce((acc, workout) => {
      acc[workout.type] = (acc[workout.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(distribution).map(type => WORKOUT_TYPES[type as keyof typeof WORKOUT_TYPES]?.name || type),
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: Object.keys(distribution).map(type => WORKOUT_TYPES[type as keyof typeof WORKOUT_TYPES]?.color || '#3b82f6'),
        borderWidth: 0
      }]
    };
  };

  // Athletic Progress Chart
  const getAthleticProgress = (testType: keyof typeof ATHLETIC_TESTS) => {
    const tests = filteredData.athleticTests
      .filter(t => t.type === testType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: tests.map(t => format(new Date(t.date), 'dd/MM', { locale: fr })),
      datasets: [{
        label: ATHLETIC_TESTS[testType].name,
        data: tests.map(t => t.value),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };
  };

  // Shooting Evolution Chart
  const getShootingEvolution = () => {
    const sessions = filteredData.shootingSessions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sessions.map(s => format(new Date(s.date), 'dd/MM', { locale: fr })),
      datasets: [{
        label: 'Pourcentage de réussite',
        data: sessions.map(s => s.percentage),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };
  };

  // Weekly Activity Chart
  const getWeeklyActivity = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayWorkouts = filteredData.workouts.filter(w => 
        new Date(w.date).toDateString() === date.toDateString()
      );
      return {
        date: format(date, 'dd/MM', { locale: fr }),
        count: dayWorkouts.length,
        duration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0)
      };
    }).reverse();

    return {
      labels: last7Days.map(d => d.date),
      datasets: [
        {
          label: 'Nombre de séances',
          data: last7Days.map(d => d.count),
          backgroundColor: '#3b82f6',
          yAxisID: 'y'
        },
        {
          label: 'Durée totale (min)',
          data: last7Days.map(d => d.duration),
          backgroundColor: '#f97316',
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-purple-100">Analysez vos performances et votre progression</p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Période d'analyse</h3>
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 jours' },
              { value: '30d', label: '30 jours' },
              { value: '90d', label: '3 mois' },
              { value: '1y', label: '1 an' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Séances totales</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.workouts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps d'entraînement</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(filteredData.workouts.reduce((sum, w) => sum + w.duration, 0) / 60)}h
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests athlétiques</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.athleticTests.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions de tir</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.shootingSessions.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des entraînements</h3>
          <div className="h-64">
            <Doughnut data={getWorkoutDistribution()} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité des 7 derniers jours</h3>
          <div className="h-64">
            <Bar data={getWeeklyActivity()} options={chartOptions} />
          </div>
        </div>

        {/* Shooting Evolution */}
        {filteredData.shootingSessions.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du tir</h3>
            <div className="h-64">
              <Line data={getShootingEvolution()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        )}

        {/* Athletic Progress */}
        {Object.keys(ATHLETIC_TESTS).map(testType => {
          const typeKey = testType as keyof typeof ATHLETIC_TESTS;
          const tests = filteredData.athleticTests.filter(t => t.type === typeKey);
          
          if (tests.length === 0) return null;

          return (
            <div key={testType} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {ATHLETIC_TESTS[typeKey].name}
              </h3>
              <div className="h-64">
                <Line data={getAthleticProgress(typeKey)} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des performances</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Workout Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Entraînements</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Moyenne par semaine</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredData.workouts.length / (timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : 52))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Durée moyenne</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredData.workouts.reduce((sum, w) => sum + w.duration, 0) / filteredData.workouts.length || 0)}min
                </span>
              </div>
            </div>
          </div>

          {/* Athletic Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Tests athlétiques</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total effectués</span>
                <span className="text-sm font-medium">{filteredData.athleticTests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Types différents</span>
                <span className="text-sm font-medium">
                  {new Set(filteredData.athleticTests.map(t => t.type)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Shooting Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Tir</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessions</span>
                <span className="text-sm font-medium">{filteredData.shootingSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">% moyen</span>
                <span className="text-sm font-medium">
                  {Math.round(filteredData.shootingSessions.reduce((sum, s) => sum + s.percentage, 0) / filteredData.shootingSessions.length || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;