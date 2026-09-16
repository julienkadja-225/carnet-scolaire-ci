import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  classLevel: z.string().min(1, "Sélectionne ta classe"),
  series: z.string().optional().nullable(),
  school: z.string().trim().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(2, "Nom de matière trop court").max(60),
  coefficient: z.coerce.number().int().min(1, "Le coefficient doit être au moins 1").max(20),
  trimester: z.coerce.number().int().min(1).max(3),
});

export const gradeSchema = z.object({
  subjectId: z.string().min(1),
  label: z.string().trim().min(1, "Précise le type d'évaluation").max(60),
  value: z.coerce.number().min(0, "La note ne peut pas être négative"),
  scale: z.coerce.number().refine((v) => v === 10 || v === 20, "Barème invalide (10 ou 20)"),
}).refine((data) => data.value <= data.scale, {
  message: "La note ne peut pas dépasser le barème",
  path: ["value"],
});

export const conductSchema = z.object({
  trimester: z.coerce.number().int().min(1).max(3),
  value: z.coerce.number().min(0, "Minimum 0").max(20, "Maximum 20"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  classLevel: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  school: z.string().trim().optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Jeton manquant"),
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});
