"use client";

import { useEffect, useState } from "react";
import type { ConductDTO, SubjectDTO } from "@/lib/types";

export interface TrimesterData {
  trimester: number;
  subjects: SubjectDTO[];
  conduct: ConductDTO | null;
}

export function useYearData() {
  const [data, setData] = useState<TrimesterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const trimesters = [1, 2, 3];
        const results = await Promise.all(
          trimesters.map(async (trimester) => {
            const [subjectsRes, conductRes] = await Promise.all([
              fetch(`/api/subjects?trimester=${trimester}`),
              fetch(`/api/conduct?trimester=${trimester}`),
            ]);
            if (!subjectsRes.ok || !conductRes.ok) {
              throw new Error("Impossible de charger les données annuelles.");
            }
            const subjectsData = await subjectsRes.json();
            const conductData = await conductRes.json();
            return {
              trimester,
              subjects: subjectsData.subjects as SubjectDTO[],
              conduct: conductData.conduct as ConductDTO,
            };
          })
        );
        if (!ignore) setData(results);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return { data, loading, error };
}
