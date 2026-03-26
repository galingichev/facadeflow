import { useState, useRef, useCallback } from 'react';

export interfaceAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'text' | 'highlight';
  x: number; // 0-1 normalized
  y: number;
  width?: number; // for circle, highlight (0-1)
  height?: number; // for circle
  text?: string; // for text annotations
  color: string;
  rotation?: number; // for arrows
  endX?: number; // for arrows
  endY?: number;
}

interface UsePhotoAnnotationReturn {
  annotations: Annotation[];
  selectedTool: Tool;
  selectedColor: string;
  setSelectedTool: (tool: Tool) => void;
  setSelectedColor: (color: string) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

type Tool = 'arrow' | 'circle' | 'text' | 'highlight' | 'pan' | 'select';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#000000'];

export function usePhotoAnnotation(): UsePhotoAnnotationReturn {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedTool, setSelectedTool] = useState<Tool>('arrow');
  const [selectedColor, setSelectedColor] = useState('#ef4444');

  const pushToHistory = useCallback((newAnnotations: Annotation[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };
    setAnnotations((prev) => {
      pushToHistory(prev);
      return [...prev, newAnnotation];
    });
  }, [pushToHistory]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations((prev) => {
      pushToHistory(prev);
      return prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann));
    });
  }, [pushToHistory]);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => {
      pushToHistory(prev);
      return prev.filter((ann) => ann.id !== id);
    });
  }, [pushToHistory]);

  const clearAnnotations = useCallback(() => {
    setAnnotations((prev) => {
      pushToHistory(prev);
      return [];
    });
  }, [pushToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setAnnotations(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setAnnotations(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  return {
    annotations,
    selectedTool,
    selectedColor,
    setSelectedTool,
    setSelectedColor,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}

export { COLORS };
