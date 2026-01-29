"use client";

import { useState, useCallback, useMemo } from "react";
import type { ApiResponse } from "@/types";
import { createInitialState } from "@/lib/api-client";
import { z } from "zod";

/**
 * Hook générique pour gérer les appels API avec les 5 états
 * Retourne un tuple [state, setState] similaire à useState
 */
export function useApiState<T>(): [ApiResponse<T>, React.Dispatch<React.SetStateAction<ApiResponse<T>>>] {
  const [state, setState] = useState<ApiResponse<T>>(createInitialState<T>());
  return [state, setState];
}

/**
 * Hook pour gérer les formulaires avec validation Zod
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  schema?: z.ZodSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const parsedValue = type === "number" ? Number(value) : value;
      setValues((prev) => ({ ...prev, [name]: parsedValue }));
      if (errors[name as keyof T]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    if (!schema) return true;
    
    const result = schema.safeParse(values);
    if (!result.success) {
      const newErrors: Partial<Record<keyof T, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof T;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [schema, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setValues,
    setErrors,
    setIsSubmitting,
    setFieldValue,
    handleChange,
    validate,
    reset,
  };
}

/**
 * Hook pour la pagination
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
  };
}
