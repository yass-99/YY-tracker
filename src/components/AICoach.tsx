import React, { useState, useEffect, useContext } from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { createStorage } from '../utils/storage';
import { UserContext } from '../context/UserContext';
import { WorkoutSession, AthleticTest, ShootingSession, AIInsight } from '../types';
import { ATHLETIC_TESTS, WORKOUT_TYPES } from '../utils/constants';

const AICoach: React.FC = () => {
  const { user } = useContext(UserContext);
  const storage = createStorage(user);

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [athleticTests, setAthleticTests] = useState<AthleticTest[]>([]);
  const [shootingSessions, setShootingSessions] = useState<ShootingSession[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    setWorkouts(storage.getWorkouts());
    setAthleticTests(storage.getAthleticTests());
    setShootingSessions(storage.getShootingSessions());
    setInsights(storage.getAIInsights());
  }, [user]);

  const generateInsights = () => {
    const newInsights: AIInsight[] = [];
    const now = new Date();

    // Analyze workout frequency
    const recentWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const daysDiff = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    if (recentWorkouts.length === 0) {
      newInsights.push({
        id: Date.now().toString(),
        date: now.toISOString(),
        type: 'alert',
        category: 'general',
        message: 'Aucun entraînement cette semaine. Il est temps de reprendre !',
        priority: 'high'
      });
    } else if (recentWorkouts.length >= 5) {
      newInsights.push({
        id: (Date.now() + 1).toString(),
        date: now.toISOString(),
        type: 'achievement',
        category: 'general',
        message: 'Excellente semaine ! Vous avez fait 5+ entraînements.',
        priority: 'low'
      });
    }

    // Analyze workout balance
    const workoutsByType = recentWorkouts.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalWorkouts = recentWorkouts.length;
    Object.entries(workoutsByType).forEach(([type, count]) => {
      const percentage = (count / totalWorkouts) * 100;
      if (percentage > 70) {
        newInsights.push({
          id: (Date.now() + Math.random()).toString(),
          date: now.toISOString(),
          type: 'recommendation',
          category: type as any,
          message: `${percentage.toFixed(0)}% de vos entraînements sont en ${WORKOUT_TYPES[type as keyof typeof WORKOUT_TYPES]?.name}. Pensez à varier !`,
          priority: 'medium'
        });
      }
    });

    // Analyze athletic progress
    Object.keys(ATHLETIC_TESTS).forEach(testType => {
      const typeKey = testType as keyof typeof ATHLETIC_TESTS;
      const tests = athleticTests
        .filter(t => t.type === typeKey)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (tests.length >= 2) {
        const latest = tests[0];
        const previous = tests[1];
        const isLowerBetter = testType.includes('sprint');
        
        const improvement = isLowerBetter ? previous.value - latest.value : latest.value - previous.value;
        
        if (improvement > 0) {
          const percentage = Math.abs((improvement / previous.value) * 100);
          newInsights.push({
            id: (Date.now() + Math.random()).toString(),
            date: now.toISOString(),
            type: 'achievement',
            category: 'athletisme',
            message: `Progrès en ${ATHLETIC_TESTS[typeKey].name} : +${percentage.toFixed(1)}% !`,
            priority: 'low'
          });
        } else if (improvement < 0) {
          newInsights.push({
            id: (Date.now() + Math.random()).toString(),
            date: now.toISOString(),
            type: 'recommendation',
            category: 'athletisme',
            message: `Stagnation en ${ATHLETIC_TESTS[typeKey].name}. Variez vos exercices !`,
            priority: 'medium'
          });
        }
      }
    });

    // Analyze shooting performance
    const recentShooting = shootingSessions.filter(s => {
      const sessionDate = new Date(s.date);
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    });

    if (recentShooting.length >= 2) {
      const averagePercentage = recentShooting.reduce((sum, s) => sum + s.percentage, 0) / recentShooting.length;
      
      if (averagePercentage >= 70) {
        newInsights.push({
          id: (Date.now() + Math.random()).toString(),
          date: now.toISOString(),
          type: 'achievement',
          category: 'basket',
          message: `Excellent tir ! Moyenne de ${averagePercentage.toFixed(0)}% ce mois-ci.`,
          priority: 'low'
        });
      } else if (averagePercentage < 40) {
        newInsights.push({
          id: (Date.now() + Math.random()).toString(),
          date: now.toISOString(),
          type: 'recommendation',
          category: 'basket',
          message: `Tir en difficulté (${averagePercentage.toFixed(0)}%). Travaillez les fondamentaux !`,
          priority: 'medium'
        });
      }

      // Analyze zone performance
      const zonePerformance = recentShooting.reduce((acc, session) => {
        session.zones.forEach(zone => {
          if (!acc[zone.zone]) acc[zone.zone] = { attempts: 0, makes: 0 };
          acc[zone.zone].attempts += zone.attempts;
          acc[zone.zone].makes += zone.makes;
        });
        return acc;
      }, {} as Record<string, { attempts: number; makes: number }>);

      Object.entries(zonePerformance).forEach(([zone, stats]) => {
        const percentage = (stats.makes / stats.attempts) * 100;
        if (percentage < 30 && stats.attempts >= 10) {
          newInsights.push({
            id: (Date.now() + Math.random()).toString(),
            date: now.toISOString(),
            type: 'recommendation',
            category: 'basket',
            message: `Zone faible: ${zone.replace('_', ' ')} (${percentage.toFixed(0)}%). Concentrez-vous sur cette zone !`,
            priority: 'medium'
          });
        }
      });
    }

    // Save insights
    newInsights.forEach(insight => storage.saveAIInsight(insight));
    setInsights(storage.getAIInsights());
  };

  const clearInsights = () => {
    storage.clearAIInsights();
    setInsights([]);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Lightbulb;
      case 'alert': return AlertTriangle;
      case 'achievement': return Award;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation': return 'text-blue-600 bg-blue-50';
      case 'alert': return 'text-red-600 bg-red-50';
      case 'achievement': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-2">IA Coach</h2>
        <p className="text-purple-100">Conseils et analyses personnalisées</p>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analyse intelligente</h3>
            <p className="text-sm text-gray-600">Générez des insights basés sur vos données</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateInsights}
              className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain className="h-4 w-4" />
              <span>Analyser</span>
            </button>
            <button
              onClick={clearInsights}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Effacer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune analyse disponible</h3>
            <p className="text-gray-600 mb-4">Cliquez sur "Analyser" pour générer des insights personnalisés</p>
          </div>
        ) : (
          insights.slice().reverse().map((insight) => {
            const Icon = getInsightIcon(insight.type);
            const colorClass = getInsightColor(insight.type);
            const priorityClass = getPriorityColor(insight.priority);

            return (
              <div key={insight.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 capitalize">{insight.type}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityClass}`}>
                          {insight.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{insight.category}</span>
                    </div>
                    
                    <p className="text-gray-700">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Features Coming Soon */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Fonctionnalités IA à venir
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Programmes d'entraînement personnalisés</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Prédiction des performances</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Détection automatique des plateaux</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Conseils nutritionnels adaptés</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Prévention des blessures</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Optimisation de la récupération</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;