import { DEFAULT_CONDUCT } from "@/lib/education";

export interface GradeLike {
  value: number;
  scale: number;
}

export interface SubjectLike {
  id: string;
  name: string;
  coefficient: number;
  grades: GradeLike[];
}

// Normalise une note sur /20 quelle que soit son barème d'origine (/10 ou /20)
export function normalizeGrade(grade: GradeLike): number {
  if (grade.scale <= 0) return 0;
  return (grade.value * 20) / grade.scale;
}

export function subjectAverage(subject: SubjectLike): number | null {
  if (subject.grades.length === 0) return null;
  const total = subject.grades.reduce((sum, g) => sum + normalizeGrade(g), 0);
  return total / subject.grades.length;
}

export interface SubjectSummary {
  id: string;
  name: string;
  coefficient: number;
  average: number | null;
  gradesCount: number;
}

export function summarizeSubjects(subjects: SubjectLike[]): SubjectSummary[] {
  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    coefficient: s.coefficient,
    average: subjectAverage(s),
    gradesCount: s.grades.length,
  }));
}

// Moyenne générale académique (matières uniquement, pondérée par les coefficients)
export function academicAverage(summaries: SubjectSummary[]): number | null {
  const graded = summaries.filter((s) => s.average !== null && s.coefficient > 0);
  if (graded.length === 0) return null;
  const weightedSum = graded.reduce((sum, s) => sum + (s.average as number) * s.coefficient, 0);
  const totalCoeff = graded.reduce((sum, s) => sum + s.coefficient, 0);
  if (totalCoeff === 0) return null;
  return weightedSum / totalCoeff;
}

// Moyenne générale incluant la conduite comme "matière" de coefficient 1
// (pratique répandue dans les bulletins ivoiriens pour le calcul du rang)
export function generalAverageWithConduct(
  summaries: SubjectSummary[],
  conduct: number = DEFAULT_CONDUCT,
  conductCoefficient: number = 1
): number | null {
  const graded = summaries.filter((s) => s.average !== null && s.coefficient > 0);
  const totalCoeff = graded.reduce((sum, s) => sum + s.coefficient, 0) + conductCoefficient;
  if (totalCoeff === 0) return null;
  const weightedSum =
    graded.reduce((sum, s) => sum + (s.average as number) * s.coefficient, 0) +
    conduct * conductCoefficient;
  return weightedSum / totalCoeff;
}

export interface Suggestion {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  currentAverage: number;
  gapToGood: number; // écart par rapport à l'objectif
  impactPerPoint: number; // gain sur la moyenne générale pour +1 point dans cette matière
  priority: "critique" | "important" | "à surveiller";
  message: string;
}

const TARGET_GOOD_AVERAGE = 12; // seuil "tableau d'honneur"

export function buildSuggestions(
  summaries: SubjectSummary[],
  generalAverage: number | null,
  target: number = TARGET_GOOD_AVERAGE
): Suggestion[] {
  const graded = summaries.filter((s) => s.average !== null && s.coefficient > 0);
  const totalCoeff = graded.reduce((sum, s) => sum + s.coefficient, 0);
  if (totalCoeff === 0) return [];

  const suggestions: Suggestion[] = graded
    .filter((s) => (s.average as number) < target)
    .map((s) => {
      const avg = s.average as number;
      const impactPerPoint = s.coefficient / totalCoeff;
      const gap = target - avg;

      let priority: Suggestion["priority"] = "à surveiller";
      if (avg < 8) priority = "critique";
      else if (avg < 10) priority = "important";

      const pointsNeeded = Math.max(0, Math.ceil((target - avg) * 10) / 10);
      const message = `Vise +${pointsNeeded.toFixed(
        1
      )} pt en ${s.name} : chaque point gagné ici fait progresser ta moyenne générale d'environ ${(
        impactPerPoint
      ).toFixed(2)} pt (coefficient ${s.coefficient}).`;

      return {
        subjectId: s.id,
        subjectName: s.name,
        coefficient: s.coefficient,
        currentAverage: avg,
        gapToGood: gap,
        impactPerPoint,
        priority,
        message,
      };
    })
    // Priorité aux matières à fort coefficient et faible moyenne (meilleur retour sur effort)
    .sort((a, b) => b.impactPerPoint * b.gapToGood - a.impactPerPoint * a.gapToGood);

  return suggestions;
}

// Moyenne annuelle : moyenne simple des moyennes de trimestre disponibles
// (pratique courante dans les établissements ivoiriens : T1, T2, T3 comptent à parts égales)
export function annualAverage(trimesterAverages: (number | null)[]): number | null {
  const graded = trimesterAverages.filter((a): a is number => a !== null);
  if (graded.length === 0) return null;
  return graded.reduce((sum, a) => sum + a, 0) / graded.length;
}

// Simule la nouvelle moyenne générale si une matière atteint une nouvelle note
export function simulateNewAverage(
  summaries: SubjectSummary[],
  subjectId: string,
  newAverage: number
): number | null {
  const updated = summaries.map((s) =>
    s.id === subjectId ? { ...s, average: newAverage } : s
  );
  return academicAverage(updated);
}
