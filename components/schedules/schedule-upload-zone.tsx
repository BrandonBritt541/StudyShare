'use client';

import { useState, useRef } from 'react';
import { uploadScheduleImages } from '@/server/actions/schedules';

interface UploadProgress {
  [fileName: string]: number;
}

interface ScheduleUploadZoneProps {
  onUploadSuccess?: () => void;
}

export function ScheduleUploadZone({ onUploadSuccess }: ScheduleUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG, and WEBP files are allowed');
      return;
    }

    // Validate file count
    if (files.length > 10) {
      setError('Maximum 10 images per upload');
      return;
    }

    // Validate file sizes (5MB each)
    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Files must be 5MB or smaller');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Initialize progress for each file
    const newProgress: UploadProgress = {};
    files.forEach(f => {
      newProgress[f.name] = 0;
    });
    setProgress(newProgress);

    // Simulate progress and upload
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] < 90) {
            updated[key] += Math.random() * 30;
          }
        });
        return updated;
      });
    }, 200);

    const result = await uploadScheduleImages(files);

    clearInterval(progressInterval);

    if (result.error) {
      setError(result.error);
      setIsUploading(false);
    } else {
      // Mark all as complete
      setProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = 100;
        });
        return updated;
      });

      // Clear after delay
      setTimeout(() => {
        setProgress({});
        setIsUploading(false);
        onUploadSuccess?.();
      }, 500);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <p className="font-semibold text-gray-900">
            {isUploading ? 'Uploading...' : 'Drag schedules here or click to browse'}
          </p>
          <p className="text-sm text-gray-600">
            JPG, PNG, or WEBP • Up to 5MB each • Maximum 10 images
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      {Object.entries(progress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progress).map(([fileName, percent]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate text-gray-700">{fileName}</span>
                <span className="text-gray-600">{Math.round(percent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
