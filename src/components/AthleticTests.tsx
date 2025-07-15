import React, { useState, useEffect, useContext } from 'react';
import { Plus, Save, Trash2, Edit, TrendingUp } from 'lucide-react';
import { createStorage } from '../utils/storage';
import { UserContext } from '../context/UserContext';
import { AthleticTest } from '../types';
import { ATHLETIC_TESTS } from '../utils/constants';

const AthleticTests: React.FC = () => {
  const { user } = useContext(UserContext);
  const storage = createStorage(user);

  const [tests, setTests] = useState<AthleticTest[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTest, setEditingTest] = useState<AthleticTest | null>(null);
  const [form, setForm] = useState({
    type: 'detente_cmj' as keyof typeof ATHLETIC_TESTS,
    date: new Date().toISOString().split('T')[0],
    value: 0,
    notes: ''
  });

  useEffect(() => {
    loadTests();
  }, [user]);

  const loadTests = () => {
    setTests(storage.getAthleticTests());
  };

  const saveTest = () => {
    const test: AthleticTest = {
      id: editingTest?.id || Date.now().toString(),
      type: form.type,
      date: form.date,
      value: form.value,
      unit: ATHLETIC_TESTS[form.type].unit,
      notes: form.notes
    };

    storage.saveAthleticTest(test);
    loadTests();
    resetForm();
  };

  const editTest = (test: AthleticTest) => {
    setEditingTest(test);
    setForm({
      type: test.type as keyof typeof ATHLETIC_TESTS,
      date: test.date,
      value: test.value,
      notes: test.notes || ''
    });
    setIsEditing(true);
  };

  const deleteTest = (id: string) => {
    storage.deleteAthleticTest(id);
    loadTests();
  };

  const resetForm = () => {
    setForm({
      type: 'detente_cmj',
      date: new Date().toISOString().split('T')[0],
      value: 0,
      notes: ''
    });
    setIsEditing(false);
    setEditingTest(null);
  };

  const getTestsByType = (type: keyof typeof ATHLETIC_TESTS) => {
    return tests.filter(test => test.type === type).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getBestPerformance = (type: keyof typeof ATHLETIC_TESTS) => {
    const typeTests = getTestsByType(type);
    if (typeTests.length === 0) return null;
    
    const isLowerBetter = type.includes('sprint');
    return typeTests.reduce((best, current) => 
      isLowerBetter 
        ? (current.value < best.value ? current : best)
        : (current.value > best.value ? current : best)
    );
  };

  const getProgressTrend = (type: keyof typeof ATHLETIC_TESTS) => {
    const typeTests = getTestsByType(type);
    if (typeTests.length < 2) return null;
    
    const recent = typeTests[0].value;
    const previous = typeTests[1].value;
    const isLowerBetter = type.includes('sprint');
    
    const improvement = isLowerBetter ? previous - recent : recent - previous;
    const percentage = Math.abs((improvement / previous) * 100);
    
    return {
      improvement: improvement > 0,
      percentage: percentage.toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-2">Tests Athlétiques</h2>
        <p className="text-orange-100">Suivez votre progression physique</p>
      </div>

      {/* Test Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Modifier le test' : 'Nouveau test'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de test</label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.entries(ATHLETIC_TESTS).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valeur ({ATHLETIC_TESTS[form.type].unit})
            </label>
            <input
              type="number"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Conditions, sensations, remarques..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={saveTest}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Modifier' : 'Enregistrer'}</span>
          </button>
          
          {isEditing && (
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Annuler</span>
            </button>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ATHLETIC_TESTS).map(([key, value]) => {
          const typeKey = key as keyof typeof ATHLETIC_TESTS;
          const bestPerf = getBestPerformance(typeKey);
          const trend = getProgressTrend(typeKey);
          const recentTests = getTestsByType(typeKey);
          
          return (
            <div key={key} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{value.name}</h4>
                <span className="text-2xl">{value.icon}</span>
              </div>
              
              <div className="space-y-2">
                {bestPerf ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Meilleur</span>
                      <span className="font-medium">{bestPerf.value} {value.unit}</span>
                    </div>
                    
                    {recentTests.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dernier</span>
                        <span className="font-medium">{recentTests[0].value} {value.unit}</span>
                      </div>
                    )}
                    
                    {trend && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tendance</span>
                        <div className={`flex items-center ${trend.improvement ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`h-4 w-4 mr-1 ${trend.improvement ? '' : 'rotate-180'}`} />
                          <span className="text-sm font-medium">{trend.percentage}%</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Aucun test enregistré</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tests History */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des tests</h3>
        
        <div className="space-y-3">
          {tests.slice().reverse().map((test) => (
            <div key={test.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{ATHLETIC_TESTS[test.type as keyof typeof ATHLETIC_TESTS].icon}</span>
                  <span className="font-medium text-gray-900">
                    {ATHLETIC_TESTS[test.type as keyof typeof ATHLETIC_TESTS].name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(test.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {test.value} {test.unit}
                  </span>
                  <button
                    onClick={() => editTest(test)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTest(test.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {test.notes && (
                <p className="text-sm text-gray-700 mt-2">{test.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AthleticTests;