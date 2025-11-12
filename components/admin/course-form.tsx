'use client';

import { useState } from 'react';
import { createCourse, updateCourse } from '@/server/actions/courses';
import { Course } from '@/server/actions/courses';

interface CourseFormProps {
  course?: Course | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const [code, setCode] = useState(course?.code || '');
  const [name, setName] = useState(course?.name || '');
  const [professors, setProfessors] = useState<string[]>(
    course?.professor_names || []
  );
  const [materials, setMaterials] = useState<string[]>(
    course?.common_materials || []
  );
  const [newProfessor, setNewProfessor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProfessor = () => {
    if (newProfessor.trim()) {
      setProfessors([...professors, newProfessor.trim()]);
      setNewProfessor('');
    }
  };

  const handleRemoveProfessor = (index: number) => {
    setProfessors(professors.filter((_, i) => i !== index));
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials([...materials, newMaterial.trim()]);
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      setError('Course code and name are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (course?.id) {
        result = await updateCourse(course.id, {
          code,
          name,
          professor_names: professors,
          common_materials: materials,
        });
      } else {
        result = await createCourse({
          code,
          name,
          professor_names: professors,
          common_materials: materials,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Course Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-900">
          Course Code
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="CS 101"
          disabled={isLoading}
          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
        />
      </div>

      {/* Course Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Course Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Introduction to Computer Science"
          disabled={isLoading}
          className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
        />
      </div>

      {/* Professors */}
      <div>
        <label className="block text-sm font-medium text-gray-900">
          Professor Names
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newProfessor}
            onChange={e => setNewProfessor(e.target.value)}
            placeholder="e.g., Dr. Smith"
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddProfessor();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddProfessor}
            disabled={isLoading || !newProfessor.trim()}
            className="rounded-lg bg-primary-100 px-4 py-2 font-medium text-primary-600 hover:bg-primary-200 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {professors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {professors.map((prof, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
              >
                {prof}
                <button
                  type="button"
                  onClick={() => handleRemoveProfessor(idx)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Materials */}
      <div>
        <label className="block text-sm font-medium text-gray-900">
          Common Materials
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newMaterial}
            onChange={e => setNewMaterial(e.target.value)}
            placeholder="e.g., Textbook, Lab Manual"
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMaterial();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddMaterial}
            disabled={isLoading || !newMaterial.trim()}
            className="rounded-lg bg-primary-100 px-4 py-2 font-medium text-primary-600 hover:bg-primary-200 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {materials.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {materials.map((mat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {mat}
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(idx)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : course?.id ? 'Update Course' : 'Create Course'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
