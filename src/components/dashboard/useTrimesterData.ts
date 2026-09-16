"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConductDTO, SubjectDTO } from "@/lib/types";

export function useTrimesterData(trimester: number) {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [conduct, setConduct] = useState<ConductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [subjectsRes, conductRes] = await Promise.all([
          fetch(`/api/subjects?trimester=${trimester}`),
          fetch(`/api/conduct?trimester=${trimester}`),
        ]);
        if (!subjectsRes.ok || !conductRes.ok) {
          throw new Error("Impossible de charger tes données.");
        }
        const subjectsData = await subjectsRes.json();
        const conductData = await conductRes.json();
        if (!ignore) {
          setSubjects(subjectsData.subjects);
          setConduct(conductData.conduct);
        }
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "Erreur inconnue");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [trimester, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { subjects, conduct, loading, error, refetch };
}
