import postgres from "postgres";
import { randomUUID } from "node:crypto";
import type {
  Role,
  AccountStatus,
  UserRow,
  SubjectRow,
  GradeRow,
  ConductRow,
  SubjectWithGrades,
  GradeWithSubject,
  PasswordResetRow,
} from "./db-types";

function createConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL manquant dans l'environnement (connexion Postgres/Supabase requise)."
    );
  }
  return postgres(connectionString, {
    ssl: "require",
    max: 1,
    prepare: false, // requis par le pooler transactionnel de Supabase (Supavisor/pgbouncer)
    transform: postgres.camel,
  });
}

const globalForDb = globalThis as unknown as { __pgSql?: ReturnType<typeof postgres> };

function getClient(): ReturnType<typeof postgres> {
  if (!globalForDb.__pgSql) {
    globalForDb.__pgSql = createConnection();
  }
  return globalForDb.__pgSql;
}

// La connexion est créée paresseusement, au premier usage réel, et non au chargement du
// module : Next.js évalue ce fichier pendant `next build` même pour des pages qui n'accèdent
// jamais à la base (ex. /_not-found), et se connecter trop tôt ferait échouer le build si
// DATABASE_URL n'est pas encore visible à cette étape.
const sql: ReturnType<typeof postgres> = new Proxy(
  (() => {}) as unknown as ReturnType<typeof postgres>,
  {
    apply(_target, _thisArg, args) {
      const client = getClient() as unknown as (...a: unknown[]) => unknown;
      return client(...args);
    },
    get(_target, prop, receiver) {
      return Reflect.get(getClient(), prop, receiver);
    },
  }
);

function nowIso(): string {
  return new Date().toISOString();
}

// ---------- Users ----------

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: Role;
  status?: AccountStatus;
  classLevel?: string | null;
  series?: string | null;
  school?: string | null;
  approvedAt?: string | null;
}

export const usersRepo = {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const rows = await sql<UserRow[]>`SELECT * FROM users WHERE email = ${email}`;
    return rows[0];
  },

  async findById(id: string): Promise<UserRow | undefined> {
    const rows = await sql<UserRow[]>`SELECT * FROM users WHERE id = ${id}`;
    return rows[0];
  },

  async create(input: CreateUserInput): Promise<UserRow> {
    const id = randomUUID();
    const rows = await sql<UserRow[]>`
      INSERT INTO users
        (id, full_name, email, password_hash, role, status, class_level, series, school, created_at, approved_at)
      VALUES
        (${id}, ${input.fullName}, ${input.email}, ${input.passwordHash}, ${input.role ?? "STUDENT"},
         ${input.status ?? "PENDING"}, ${input.classLevel ?? null}, ${input.series ?? null},
         ${input.school ?? null}, ${nowIso()}, ${input.approvedAt ?? null})
      RETURNING *
    `;
    return rows[0];
  },

  async listAll(status?: AccountStatus): Promise<UserRow[]> {
    if (status) {
      return sql<UserRow[]>`SELECT * FROM users WHERE status = ${status} ORDER BY created_at DESC`;
    }
    return sql<UserRow[]>`SELECT * FROM users ORDER BY created_at DESC`;
  },

  async approve(id: string, approvedById: string): Promise<UserRow> {
    const rows = await sql<UserRow[]>`
      UPDATE users
      SET status = 'APPROVED', approved_at = ${nowIso()}, approved_by_id = ${approvedById}, rejected_reason = NULL
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async reject(id: string, reason: string | null): Promise<UserRow> {
    const rows = await sql<UserRow[]>`
      UPDATE users SET status = 'REJECTED', rejected_reason = ${reason} WHERE id = ${id} RETURNING *
    `;
    return rows[0];
  },

  async setRole(id: string, role: Role): Promise<UserRow> {
    const rows = await sql<UserRow[]>`UPDATE users SET role = ${role} WHERE id = ${id} RETURNING *`;
    return rows[0];
  },

  async updateProfile(
    id: string,
    input: { fullName: string; classLevel?: string | null; series?: string | null; school?: string | null }
  ): Promise<UserRow> {
    const rows = await sql<UserRow[]>`
      UPDATE users
      SET full_name = ${input.fullName}, class_level = ${input.classLevel ?? null},
          series = ${input.series ?? null}, school = ${input.school ?? null}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  },

  async updatePassword(id: string, passwordHash: string): Promise<UserRow> {
    const rows = await sql<UserRow[]>`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id} RETURNING *
    `;
    return rows[0];
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id}`;
  },
};

// ---------- Subjects ----------

export interface CreateSubjectInput {
  userId: string;
  name: string;
  coefficient: number;
  trimester: number;
}

export const subjectsRepo = {
  async listByUser(userId: string, trimester?: number): Promise<SubjectWithGrades[]> {
    const subjects = trimester
      ? await sql<SubjectRow[]>`
          SELECT * FROM subjects WHERE user_id = ${userId} AND trimester = ${trimester} ORDER BY created_at ASC
        `
      : await sql<SubjectRow[]>`SELECT * FROM subjects WHERE user_id = ${userId} ORDER BY created_at ASC`;

    if (subjects.length === 0) return [];

    const subjectIds = subjects.map((s) => s.id);
    const grades = await sql<GradeRow[]>`
      SELECT * FROM grades WHERE subject_id IN ${sql(subjectIds)} ORDER BY created_at DESC
    `;

    return subjects.map((s) => ({
      ...s,
      grades: grades.filter((g) => g.subjectId === s.id),
    }));
  },

  async findById(id: string): Promise<SubjectRow | undefined> {
    const rows = await sql<SubjectRow[]>`SELECT * FROM subjects WHERE id = ${id}`;
    return rows[0];
  },

  async findByUserTrimesterName(
    userId: string,
    trimester: number,
    name: string
  ): Promise<SubjectRow | undefined> {
    const rows = await sql<SubjectRow[]>`
      SELECT * FROM subjects
      WHERE user_id = ${userId} AND trimester = ${trimester} AND LOWER(name) = LOWER(${name})
    `;
    return rows[0];
  },

  async create(input: CreateSubjectInput): Promise<SubjectWithGrades> {
    const id = randomUUID();
    const rows = await sql<SubjectRow[]>`
      INSERT INTO subjects (id, user_id, name, coefficient, trimester, created_at)
      VALUES (${id}, ${input.userId}, ${input.name}, ${input.coefficient}, ${input.trimester}, ${nowIso()})
      RETURNING *
    `;
    return { ...rows[0], grades: [] };
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM subjects WHERE id = ${id}`;
  },
};

// ---------- Grades ----------

export interface CreateGradeInput {
  subjectId: string;
  label: string;
  value: number;
  scale: number;
}

export const gradesRepo = {
  async create(input: CreateGradeInput): Promise<GradeRow> {
    const id = randomUUID();
    const rows = await sql<GradeRow[]>`
      INSERT INTO grades (id, subject_id, label, value, scale, created_at)
      VALUES (${id}, ${input.subjectId}, ${input.label}, ${input.value}, ${input.scale}, ${nowIso()})
      RETURNING *
    `;
    return rows[0];
  },

  async findByIdWithSubject(id: string): Promise<GradeWithSubject | undefined> {
    const gradeRows = await sql<GradeRow[]>`SELECT * FROM grades WHERE id = ${id}`;
    const grade = gradeRows[0];
    if (!grade) return undefined;
    const subjectRows = await sql<SubjectRow[]>`SELECT * FROM subjects WHERE id = ${grade.subjectId}`;
    return { ...grade, subject: subjectRows[0] };
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM grades WHERE id = ${id}`;
  },
};

// ---------- Conduct ----------

export const conductRepo = {
  async find(userId: string, trimester: number): Promise<ConductRow | undefined> {
    const rows = await sql<ConductRow[]>`
      SELECT * FROM conducts WHERE user_id = ${userId} AND trimester = ${trimester}
    `;
    return rows[0];
  },

  async upsert(userId: string, trimester: number, value: number): Promise<ConductRow> {
    const rows = await sql<ConductRow[]>`
      INSERT INTO conducts (id, user_id, trimester, value, updated_at)
      VALUES (${randomUUID()}, ${userId}, ${trimester}, ${value}, ${nowIso()})
      ON CONFLICT (user_id, trimester)
      DO UPDATE SET value = ${value}, updated_at = ${nowIso()}
      RETURNING *
    `;
    return rows[0];
  },
};

// ---------- Password reset ----------

export const passwordResetRepo = {
  async create(userId: string, tokenHash: string, expiresAt: string): Promise<PasswordResetRow> {
    const rows = await sql<PasswordResetRow[]>`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
      VALUES (${randomUUID()}, ${userId}, ${tokenHash}, ${expiresAt}, ${nowIso()})
      RETURNING *
    `;
    return rows[0];
  },

  async findValidByTokenHash(tokenHash: string): Promise<PasswordResetRow | undefined> {
    const rows = await sql<PasswordResetRow[]>`
      SELECT * FROM password_reset_tokens WHERE token_hash = ${tokenHash}
    `;
    const row = rows[0];
    if (!row) return undefined;
    if (row.usedAt) return undefined;
    if (new Date(row.expiresAt).getTime() < Date.now()) return undefined;
    return row;
  },

  async markUsed(id: string): Promise<void> {
    await sql`UPDATE password_reset_tokens SET used_at = ${nowIso()} WHERE id = ${id}`;
  },

  async invalidateAllForUser(userId: string): Promise<void> {
    await sql`
      UPDATE password_reset_tokens SET used_at = ${nowIso()} WHERE user_id = ${userId} AND used_at IS NULL
    `;
  },
};

// ---------- Admin stats ----------

export interface CountRow {
  key: string;
  count: number;
}

export const statsRepo = {
  async usersByRoleAndStatus(): Promise<{ role: Role; status: AccountStatus; count: number }[]> {
    const rows = await sql<{ role: Role; status: AccountStatus; count: number }[]>`
      SELECT role, status, COUNT(*)::int as count FROM users GROUP BY role, status
    `;
    return rows;
  },

  async studentsByClassLevel(): Promise<CountRow[]> {
    return sql<CountRow[]>`
      SELECT COALESCE(class_level, 'Non renseigné') as key, COUNT(*)::int as count
      FROM users WHERE role = 'STUDENT' GROUP BY key ORDER BY key
    `;
  },

  async registrationsByMonth(months: number): Promise<CountRow[]> {
    const since = new Date(Date.now() - months * 31 * 24 * 60 * 60 * 1000).toISOString();
    return sql<CountRow[]>`
      SELECT substr(created_at, 1, 7) as key, COUNT(*)::int as count
      FROM users
      WHERE created_at >= ${since}
      GROUP BY key ORDER BY key
    `;
  },

  async averageBySubjectName(limit: number): Promise<{ name: string; average: number; count: number }[]> {
    return sql<{ name: string; average: number; count: number }[]>`
      SELECT s.name as name, AVG(g.value * 20.0 / g.scale) as average, COUNT(*)::int as count
      FROM grades g
      JOIN subjects s ON s.id = g.subject_id
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT ${limit}
    `;
  },

  async totals(): Promise<{
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalSubjects: number;
    totalGrades: number;
    schoolAverage: number | null;
  }> {
    const [{ c: totalUsers }] = await sql<{ c: number }[]>`SELECT COUNT(*)::int as c FROM users`;
    const [{ c: totalStudents }] = await sql<{ c: number }[]>`
      SELECT COUNT(*)::int as c FROM users WHERE role = 'STUDENT'
    `;
    const [{ c: totalAdmins }] = await sql<{ c: number }[]>`
      SELECT COUNT(*)::int as c FROM users WHERE role IN ('ADMIN', 'SUPERADMIN')
    `;
    const [{ c: totalSubjects }] = await sql<{ c: number }[]>`SELECT COUNT(*)::int as c FROM subjects`;
    const [{ c: totalGrades }] = await sql<{ c: number }[]>`SELECT COUNT(*)::int as c FROM grades`;
    const [{ a: schoolAverage }] = await sql<{ a: number | null }[]>`
      SELECT AVG(value * 20.0 / scale) as a FROM grades
    `;

    return { totalUsers, totalStudents, totalAdmins, totalSubjects, totalGrades, schoolAverage };
  },
};
