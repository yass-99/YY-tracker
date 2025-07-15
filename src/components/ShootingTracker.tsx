import React, { useState, useEffect, useContext } from 'react';
import { Save, Trash2, Edit, Target, Plus, X, BarChart2 } from 'lucide-react';
import { createStorage } from '../utils/storage';
import { UserContext } from '../context/UserContext';
import { ShootingSession, ShootingZone } from '../types';
import { SHOOTING_ZONES } from '../utils/constants';

const ShootingTracker: React.FC = () => {
  const { user } = useContext(UserContext);
  const storage = createStorage(user);

  const [sessions, setSessions] = useState<ShootingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ShootingZone[]>(
    SHOOTING_ZONES.map(zone => ({ zone: zone.id, attempts: 0, makes: 0, percentage: 0 }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingSession, setEditingSession] = useState<ShootingSession | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'history' | 'stats'>('tracker');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = () => {
    setSessions(storage.getShootingSessions());
  };

  const updateZone = (zoneId: string, field: 'attempts' | 'makes', value: number) => {
    setCurrentSession(prev => 
      prev.map(zone => {
        if (zone.zone === zoneId) {
          const updated = { 
            ...zone, 
            [field]: value,
            makes: field === 'attempts' ? Math.min(zone.makes, value) : value
          };
          updated.percentage = updated.attempts > 0 ? Math.round((updated.makes / updated.attempts) * 100) : 0;
          return updated;
        }
        return zone;
      })
    );
  };

  const incrementZone = (zoneId: string, field: 'attempts' | 'makes') => {
    setCurrentSession(prev => 
      prev.map(zone => {
        if (zone.zone === zoneId) {
          const newValue = zone[field] + 1;
          const updated = { 
            ...zone, 
            [field]: newValue,
            makes: field === 'attempts' ? zone.makes : Math.min(newValue, zone.attempts)
          };
          updated.percentage = updated.attempts > 0 ? Math.round((updated.makes / updated.attempts) * 100) : 0;
          return updated;
        }
        return zone;
      })
    );
  };

  const saveSession = () => {
    const totalAttempts = currentSession.reduce((sum, zone) => sum + zone.attempts, 0);
    const totalMakes = currentSession.reduce((sum, zone) => sum + zone.makes, 0);
    const overallPercentage = totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;

    const session: ShootingSession = {
      id: editingSession?.id || Date.now().toString(),
      date: new Date().toISOString(),
      zones: currentSession.filter(zone => zone.attempts > 0),
      totalAttempts,
      totalMakes,
      percentage: overallPercentage
    };

    storage.saveShootingSession(session);
    loadSessions();
    resetSession();
    setActiveTab('history');
  };

  const editSession = (session: ShootingSession) => {
    setEditingSession(session);
    setCurrentSession(
      SHOOTING_ZONES.map(zoneConfig => {
        const sessionZone = session.zones.find(z => z.zone === zoneConfig.id);
        return sessionZone || { zone: zoneConfig.id, attempts: 0, makes: 0, percentage: 0 };
      })
    );
    setIsEditing(true);
    setActiveTab('tracker');
  };

  const deleteSession = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette session ?')) {
      storage.deleteShootingSession(id);
      loadSessions();
    }
  };

  const resetSession = () => {
    setCurrentSession(
      SHOOTING_ZONES.map(zone => ({ zone: zone.id, attempts: 0, makes: 0, percentage: 0 }))
    );
    setIsEditing(false);
    setEditingSession(null);
    setSelectedZone(null);
  };

  const getZoneConfig = (zoneId: string) => {
    return SHOOTING_ZONES.find(z => z.id === zoneId);
  };

  const getZoneColor = (percentage: number) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    if (percentage >= 40) return '#f97316';
    return '#ef4444';
  };

  const getAverageByZone = (zoneId: string) => {
    const zoneSessions = sessions.map(session => 
      session.zones.find(z => z.zone === zoneId)
    ).filter(Boolean);

    if (zoneSessions.length === 0) return 0;

    const totalAttempts = zoneSessions.reduce((sum, zone) => sum + (zone?.attempts || 0), 0);
    const totalMakes = zoneSessions.reduce((sum, zone) => sum + (zone?.makes || 0), 0);

    return totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;
  };

  const totalAttempts = currentSession.reduce((sum, zone) => sum + zone.attempts, 0);
  const totalMakes = currentSession.reduce((sum, zone) => sum + zone.makes, 0);
  const overallPercentage = totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-2xl text-white">
        <h1 className="text-3xl font-bold mb-2">Suivi des Tirs Basketball</h1>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'tracker' ? 'bg-white text-green-600 font-bold' : 'bg-green-700 text-white hover:bg-green-800'}`}
          >
            <Plus className="inline mr-2" size={18} />
            Nouvelle Session
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-green-600 font-bold' : 'bg-green-700 text-white hover:bg-green-800'}`}
          >
            <Target className="inline mr-2" size={18} />
            Historique
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'stats' ? 'bg-white text-green-600 font-bold' : 'bg-green-700 text-white hover:bg-green-800'}`}
          >
            <BarChart2 className="inline mr-2" size={18} />
            Statistiques
          </button>
        </div>
      </div>

      {/* Tracker Tab */}
      {activeTab === 'tracker' && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier Session' : 'Nouvelle Session'}
            </h2>
            {isEditing && (
              <button
                onClick={resetSession}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Interactive Court */}
             <div className="relative bg-amber-50 p-8 rounded-lg mb-8 border-2 border-amber-200">
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative bg-amber-100 rounded-lg" style={{ height: '400px' }}>
          {/* Ligne des 3 points */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-64 border-t-2 border-amber-600" />
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-amber-600" style={{ marginLeft: '-32px' }} />
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-amber-600" style={{ marginLeft: '32px' }} />

          {/* Cercles et lignes du terrain */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-60 border-2 border-amber-600 rounded-t-full" />
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-amber-600 rounded-full" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 border-2 border-amber-600" />

          {/* Zones de tir améliorées */}
          {SHOOTING_ZONES.map((zone) => {
            const zoneData = currentSession.find(z => z.zone === zone.id);
            const percentage = zoneData?.percentage || 0;
            const color = getZoneColor(percentage);
            const isSelected = selectedZone === zone.id;
            const zoneConfig = getZoneConfig(zone.id);

            return (
              <div
                key={zone.id}
                className={`absolute cursor-pointer transition-all duration-200 ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
                style={{
                  ...getZonePosition(zone.id),
                  background: percentage > 0 ? `radial-gradient(circle at center, ${color} 0%, ${color} ${percentage}%, transparent ${percentage}%, transparent 100%)` : 'rgba(209, 213, 219, 0.4)',
                  border: percentage > 0 ? `2px solid ${color}` : '2px dashed #9CA3AF',
                  boxShadow: isSelected ? `0 0 0 3px ${color}` : 'none'
                }}
                onClick={() => setSelectedZone(zone.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs font-bold text-center p-1" style={{ 
                    color: percentage > 50 ? 'white' : 'black',
                    textShadow: percentage > 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                  }}>
                    {percentage > 0 ? `${percentage}%` : zoneConfig?.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
          {/* Zone Input (only shown when a zone is selected) */}
          {selectedZone && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {getZoneConfig(selectedZone)?.name}
                </h3>
                <button 
                  onClick={() => setSelectedZone(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tentés</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateZone(selectedZone, 'attempts', Math.max(0, (currentSession.find(z => z.zone === selectedZone)?.attempts || 0) - 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={currentSession.find(z => z.zone === selectedZone)?.attempts || 0}
                        onChange={(e) => updateZone(selectedZone, 'attempts', parseInt(e.target.value) || 0)}
                        className="flex-1 p-2 border border-gray-300 text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button 
                        onClick={() => incrementZone(selectedZone, 'attempts')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Réussis</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => updateZone(selectedZone, 'makes', Math.max(0, (currentSession.find(z => z.zone === selectedZone)?.makes || 0) - 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={currentSession.find(z => z.zone === selectedZone)?.attempts || 0}
                        value={currentSession.find(z => z.zone === selectedZone)?.makes || 0}
                        onChange={(e) => updateZone(selectedZone, 'makes', parseInt(e.target.value) || 0)}
                        className="flex-1 p-2 border border-gray-300 text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button 
                        onClick={() => incrementZone(selectedZone, 'makes')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold mb-2" style={{ color: getZoneColor(currentSession.find(z => z.zone === selectedZone)?.percentage || 0) }}>
                    {currentSession.find(z => z.zone === selectedZone)?.percentage || 0}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Précision
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Résumé de la Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Tentés</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAttempts}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Réussis</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalMakes}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Pourcentage Global</p>
                <p className="text-3xl font-bold" style={{ color: getZoneColor(overallPercentage) }}>
                  {overallPercentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={saveSession}
              disabled={totalAttempts === 0}
              className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-lg font-bold transition-all ${totalAttempts > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              <Save className="h-5 w-5" />
              <span>{isEditing ? 'Mettre à jour la Session' : 'Enregistrer la Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune session enregistrée</h3>
              <p className="mt-1 text-gray-500">Commencez par créer une nouvelle session de tir</p>
              <button
                onClick={() => setActiveTab('tracker')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Nouvelle Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice().reverse().map((session) => (
                <div key={session.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {new Date(session.date).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.zones.filter(z => z.attempts > 0).length} zones travaillées
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: getZoneColor(session.percentage) }}>
                          {session.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.totalMakes}/{session.totalAttempts} tirs
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editSession(session)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {session.zones.filter(z => z.attempts > 0).map((zone) => {
                      const config = getZoneConfig(zone.zone);
                      return (
                        <div 
                          key={zone.zone} 
                          className="p-2 bg-white rounded-lg border border-gray-200 text-center cursor-pointer hover:border-green-300 transition-colors"
                          onClick={() => {
                            editSession(session);
                            setSelectedZone(zone.zone);
                          }}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-1">{config?.name}</div>
                          <div 
                            className="text-lg font-bold"
                            style={{ color: getZoneColor(zone.percentage) }}
                          >
                            {zone.percentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {zone.makes}/{zone.attempts}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
{activeTab === 'stats' && (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos Statistiques</h2>
    
    {sessions.length === 0 ? (
      <div className="text-center py-12">
        <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune donnée statistique</h3>
        <p className="mt-1 text-gray-500">Commencez par enregistrer des sessions de tir</p>
        <button
          onClick={() => setActiveTab('tracker')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Nouvelle Session
        </button>
      </div>
    ) : (
      <>
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Globale</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Sessions totales</p>
              <p className="text-3xl font-bold text-gray-900">
                {sessions.length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Tirs tentés</p>
              <p className="text-3xl font-bold text-gray-900">
                {sessions.reduce((sum, session) => sum + session.totalAttempts, 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Moyenne globale</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(
                  (sessions.reduce((sum, session) => sum + session.totalMakes, 0) /
                  sessions.reduce((sum, session) => sum + session.totalAttempts, 0)) * 100
                )}%
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Moyennes par Zone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOOTING_ZONES.map((zone) => {
              const average = getAverageByZone(zone.id);
              return (
                <div 
                  key={zone.id} 
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveTab('history')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{zone.name}</span>
                    <span 
                      className="text-xl font-bold"
                      style={{ color: getZoneColor(average) }}
                    >
                      {average}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${average}%`,
                        backgroundColor: getZoneColor(average)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>
)}
    </div>
  );
};

// Helper function to position zones on the court
const getZonePosition = (zoneId: string) => {
  const positions: Record<string, React.CSSProperties> = {
    left_corner: { 
      bottom: '10px', 
      left: '10px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    left_wing: { 
      bottom: '50px', 
      left: '50px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    left_elbow: { 
      bottom: '120px', 
      left: '100px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    top_key: { 
      bottom: '180px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '60px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    right_elbow: { 
      bottom: '120px', 
      right: '100px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    right_wing: { 
      bottom: '50px', 
      right: '50px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    right_corner: { 
      bottom: '10px', 
      right: '10px', 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paint: { 
      bottom: '30px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '50px', 
      height: '60px', 
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    free_throw: { 
      bottom: '100px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '40px', 
      height: '40px', 
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };
  
  return positions[zoneId] || {};
};

export default ShootingTracker;