// Références au système éducatif ivoirien (collège + lycée)

export const CLASS_LEVELS = [
  { value: "6e", label: "6ème" },
  { value: "5e", label: "5ème" },
  { value: "4e", label: "4ème" },
  { value: "3e", label: "3ème" },
  { value: "2nde", label: "2nde" },
  { value: "1ere", label: "1ère" },
  { value: "tle", label: "Terminale" },
] as const;

export function getClassLabel(value: string | null): string {
  if (!value) return "—";
  return CLASS_LEVELS.find((c) => c.value === value)?.label ?? value;
}

export const SERIES_BY_LEVEL: Record<string, string[]> = {
  "2nde": ["Tronc commun"],
  "1ere": ["A1", "A2", "C", "D"],
  tle: ["A1", "A2", "C", "D"],
};

export const TRIMESTERS = [
  { value: 1, label: "1er Trimestre" },
  { value: 2, label: "2ème Trimestre" },
  { value: 3, label: "3ème Trimestre" },
] as const;

export const GRADE_LABELS = [
  "Interrogation écrite",
  "Devoir",
  "Composition",
  "Exposé / TP",
  "Autre",
] as const;

// Matières usuelles proposées par niveau (collège/lycée, à titre indicatif)
export const SUGGESTED_SUBJECTS: Record<string, { name: string; coefficient: number }[]> = {
  "6e": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 4 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 2 },
    { name: "EPS", coefficient: 1 },
    { name: "Éducation Civique et Morale", coefficient: 1 },
  ],
  "5e": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 4 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 2 },
    { name: "EPS", coefficient: 1 },
  ],
  "4e": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 4 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 2 },
    { name: "Physique-Chimie", coefficient: 2 },
    { name: "EPS", coefficient: 1 },
  ],
  "3e": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 4 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 2 },
    { name: "Physique-Chimie", coefficient: 2 },
    { name: "EPS", coefficient: 1 },
  ],
  "2nde": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 4 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 2 },
    { name: "Physique-Chimie", coefficient: 2 },
    { name: "EPS", coefficient: 1 },
  ],
  "1ere": [
    { name: "Mathématiques", coefficient: 4 },
    { name: "Français", coefficient: 3 },
    { name: "Philosophie", coefficient: 2 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 3 },
    { name: "Physique-Chimie", coefficient: 3 },
    { name: "EPS", coefficient: 1 },
  ],
  tle: [
    { name: "Mathématiques", coefficient: 5 },
    { name: "Français", coefficient: 2 },
    { name: "Philosophie", coefficient: 3 },
    { name: "Anglais", coefficient: 2 },
    { name: "Histoire-Géographie", coefficient: 2 },
    { name: "SVT", coefficient: 4 },
    { name: "Physique-Chimie", coefficient: 4 },
    { name: "EPS", coefficient: 1 },
  ],
};

export const DEFAULT_CONDUCT = 18;

export interface Mention {
  label: string;
  color: string; // classe tailwind
  min: number;
}

// Barème des appréciations utilisé dans les bulletins ivoiriens
export const MENTIONS: Mention[] = [
  { label: "Félicitations", color: "text-emerald-700 bg-emerald-100", min: 16 },
  { label: "Encouragements", color: "text-teal-700 bg-teal-100", min: 14 },
  { label: "Tableau d'honneur", color: "text-blue-700 bg-blue-100", min: 12 },
  { label: "Passable", color: "text-amber-700 bg-amber-100", min: 10 },
  { label: "Avertissement (travail insuffisant)", color: "text-orange-700 bg-orange-100", min: 8 },
  { label: "Blâme", color: "text-red-700 bg-red-100", min: 0 },
];

export function getMention(average: number): Mention {
  return MENTIONS.find((m) => average >= m.min) ?? MENTIONS[MENTIONS.length - 1];
}
