import { useState } from 'react';

export type Annotation = Record<string, any>;

export const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export const usePhotoAnnotation = () => {
  const [selectedTool, setSelectedTool] = useState<'arrow' | 'text' | 'highlight' | 'draw' | 'pan' | 'circle'>('arrow');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const addAnnotation = (annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    annotations,
    addAnnotation,
    deleteAnnotation,
  };
};
