export interface GradeDTO {
  id: string;
  subjectId: string;
  label: string;
  value: number;
  scale: number;
  createdAt: string;
}

export interface SubjectDTO {
  id: string;
  userId: string;
  name: string;
  coefficient: number;
  trimester: number;
  createdAt: string;
  grades: GradeDTO[];
}

export interface ConductDTO {
  trimester: number;
  value: number;
  userId: string;
}
