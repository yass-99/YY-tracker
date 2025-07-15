import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import { storage } from '../utils/storage';
import { WorkoutSession, Exercise } from '../types';
import { WORKOUT_TYPES } from '../utils/constants';

const WorkoutTracker: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutSession | null>(null);
  const [form, setForm] = useState({
    type: 'musculation' as 'musculation' | 'athletisme' | 'basket',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    exercises: [] as Exercise[],
    notes: ''
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    setWorkouts(storage.getWorkouts());
  };

  const addExercise = () => {
    setForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        name: '',
        sets: 0,
        reps: 0,
        weight: 0,
        notes: ''
      }]
    }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const removeExercise = (index: number) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const saveWorkout = () => {
    const workout: WorkoutSession = {
      id: editingWorkout?.id || Date.now().toString(),
      ...form
    };

    storage.saveWorkout(workout);
    loadWorkouts();
    resetForm();
  };

  const editWorkout = (workout: WorkoutSession) => {
    setEditingWorkout(workout);
    setForm({
      type: workout.type,
      date: workout.date,
      duration: workout.duration,
      exercises: workout.exercises,
      notes: workout.notes || ''
    });
    setIsEditing(true);
  };

  const deleteWorkout = (id: string) => {
    storage.deleteWorkout(id);
    loadWorkouts();
  };

  const resetForm = () => {
    setForm({
      type: 'musculation',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      exercises: [],
      notes: ''
    });
    setIsEditing(false);
    setEditingWorkout(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-white">
        <h2 className="text-2xl font-bold mb-2">Suivi des Entraînements</h2>
        <p className="text-blue-100">Enregistrez et suivez vos séances de sport</p>
      </div>

      {/* Workout Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Modifier la séance' : 'Nouvelle séance'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(WORKOUT_TYPES).map(([key, value]) => (
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durée (min)</label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Exercices</h4>
            <button
              onClick={addExercise}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {form.exercises.map((exercise, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Nom de l'exercice"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Séries"
                    value={exercise.sets || ''}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps || ''}
                    onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Poids (kg)"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeExercise(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Notes"
                  value={exercise.notes || ''}
                  onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes sur la séance..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={saveWorkout}
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

      {/* Workouts List */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des séances</h3>
        
        <div className="space-y-3">
          {workouts.slice().reverse().map((workout) => (
            <div key={workout.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: WORKOUT_TYPES[workout.type].color }}
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {WORKOUT_TYPES[workout.type].name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(workout.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {workout.duration}min
                  </span>
                  <button
                    onClick={() => editWorkout(workout)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Exercices ({workout.exercises.length})</p>
                  <div className="space-y-1">
                    {workout.exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        {exercise.name} 
                        {exercise.sets && exercise.reps && (
                          <span className="text-gray-500 ml-2">
                            {exercise.sets}x{exercise.reps}
                          </span>
                        )}
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{workout.exercises.length - 3} autres...
                      </div>
                    )}
                  </div>
                </div>
                
                {workout.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{workout.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;