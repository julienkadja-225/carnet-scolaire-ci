"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { getClassLabel } from "@/lib/education";

interface StatsResponse {
  totals: {
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalSubjects: number;
    totalGrades: number;
    schoolAverage: number | null;
  };
  statusBreakdown: { pending: number; approved: number; rejected: number };
  studentsByClassLevel: { key: string; count: number }[];
  registrationsByMonth: { key: string; count: number }[];
  averageBySubject: { name: string; average: number; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  "En attente": "#f77f00",
  Validé: "#1a5d3a",
  Rejeté: "#dc2626",
};

const BAR_COLOR = "#1a5d3a";

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

export default function AdminDashboard({ canManageRoles }: { canManageRoles: boolean }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement");
        if (!ignore) setStats(data);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-foreground/50">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Impossible de charger les statistiques."}
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "En attente", value: stats.statusBreakdown.pending },
    { name: "Validé", value: stats.statusBreakdown.approved },
    { name: "Rejeté", value: stats.statusBreakdown.rejected },
  ].filter((d) => d.value > 0);

  const classData = stats.studentsByClassLevel.map((c) => ({
    name: c.key === "Non renseigné" ? c.key : getClassLabel(c.key),
    count: c.count,
  }));

  const registrationData = stats.registrationsByMonth.map((r) => ({
    name: monthLabel(r.key),
    count: r.count,
  }));

  const subjectData = stats.averageBySubject.map((s) => ({
    name: s.name,
    average: Math.round(s.average * 100) / 100,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Tableau de bord</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Vue d&apos;ensemble de l&apos;activité sur Carnet Scolaire CI.
          </p>
        </div>
        {stats.statusBreakdown.pending > 0 && (
          <Link
            href="/admin/demandes"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {stats.statusBreakdown.pending} demande{stats.statusBreakdown.pending > 1 ? "s" : ""} en
            attente →
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Élèves" value={String(stats.totals.totalStudents)} />
        <KpiCard label="Administrateurs" value={String(stats.totals.totalAdmins)} />
        <KpiCard label="Demandes en attente" value={String(stats.statusBreakdown.pending)} highlight />
        <KpiCard label="Matières créées" value={String(stats.totals.totalSubjects)} />
        <KpiCard
          label="Moyenne de l'école"
          value={stats.totals.schoolAverage !== null ? stats.totals.schoolAverage.toFixed(2) : "—"}
          suffix="/20"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Comptes par statut">
          {statusData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? BAR_COLOR} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <Legend items={statusData.map((d) => ({ label: d.name, color: STATUS_COLORS[d.name] }))} />
        </ChartCard>

        <ChartCard title="Élèves par classe">
          {classData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Élèves" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Inscriptions (6 derniers mois)">
          {registrationData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Nouveaux comptes"
                  stroke={BAR_COLOR}
                  fill={BAR_COLOR}
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Moyenne par matière (tous élèves)">
          {subjectData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
                <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="average" name="Moyenne /20" fill="#f77f00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {canManageRoles && (
        <p className="mt-8 text-center text-xs text-foreground/40">
          Connecté en tant que super administrateur — tu peux promouvoir des comptes depuis la page
          Utilisateurs.
        </p>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-accent bg-accent/5" : "border-border bg-surface"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-2 text-xl font-bold text-brand-dark">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-foreground/50">{suffix}</span>}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-foreground/40">
      Pas encore de données
    </div>
  );
}

function Legend({ items }: { items: { label: string; color?: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-foreground/65">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.color ?? BAR_COLOR }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
