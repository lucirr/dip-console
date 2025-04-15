import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CSSProperties } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

/**
 * Shared styles for CodeMirror editor components
 * Used across the application for consistent code editor styling
 */
export const codeMirrorStyles: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '14px',
};