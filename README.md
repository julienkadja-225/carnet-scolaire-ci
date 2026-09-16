# Carnet Scolaire CI

Application web pour les élèves de Côte d'Ivoire : demande d'inscription validée par un
administrateur, gestion des matières et coefficients, saisie des notes (/20 ou /10), calcul des
moyennes par matière, de la moyenne générale et de la moyenne annuelle (avec note de conduite par
défaut à 18/20), conseils personnalisés pour progresser, et tableau de bord d'administration avec
statistiques.

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres) via [`postgres`](https://github.com/porsager/postgres),
  déployé sur [Vercel](https://vercel.com)
- Authentification maison par cookie de session signé (JWT via `jose`) + `bcryptjs`
- [`recharts`](https://recharts.org) pour le tableau de bord admin

## Démarrage en local

1. Crée un projet [Supabase](https://supabase.com) (gratuit).
2. Dans **Project Settings → Database → Connection string**, copie la chaîne **Session pooler**
   (port `5432`) dans `.env` sous `DATABASE_URL`.
   > Le pooler **transactionnel** (port `6543`, `pgbouncer=true`) provoque des timeouts avec le
   > client `postgres.js` utilisé ici — utilise le pooler de session (port 5432), plus fiable pour
   > ce projet.
3. Installe les dépendances et applique le schéma :

```bash
npm install
npm run db:migrate
npm run seed
npm run dev
```

`db:migrate` crée les tables (`users`, `subjects`, `grades`, `conducts`, `password_reset_tokens`)
sur ta base Supabase — à relancer uniquement si le schéma change. `seed` crée un compte **super
administrateur** à partir des variables définies dans `.env` (`SUPERADMIN_EMAIL`,
`SUPERADMIN_PASSWORD`). Change ces valeurs avant la mise en production, et change le mot de passe
après la première connexion.

L'application est ensuite disponible sur http://localhost:3000.

## Déploiement sur Vercel

1. Pousse le dépôt sur GitHub.
2. Sur [vercel.com](https://vercel.com), importe le dépôt (Framework Preset : Next.js, détecté
   automatiquement).
3. Dans les **Environment Variables** du projet Vercel, ajoute :
   - `DATABASE_URL` — la même chaîne de connexion Supabase (pooler de session, port 5432) qu'en local
   - `SESSION_SECRET` — une chaîne aléatoire longue et unique (`openssl rand -hex 32`)
   - `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME` — utilisées uniquement par
     `npm run seed`, pas nécessaires à l'exécution de l'app elle-même
4. Avant le premier déploiement (ou après), lance `npm run db:migrate` et `npm run seed` **depuis
   ta machine locale** avec le même `DATABASE_URL` que celui configuré sur Vercel — ce sont des
   scripts ponctuels, pas des étapes de build.
5. Déploie. Vercel redéploiera automatiquement à chaque `git push` sur la branche connectée.

## Rôles

- **Élève** : s'inscrit via `/inscription`, attend la validation, puis gère ses matières, ses
  notes et consulte ses moyennes et conseils sur `/dashboard`. Peut modifier son profil et son mot
  de passe depuis `/profil`.
- **Administrateur** : valide ou rejette les demandes d'inscription (`/admin/demandes`), consulte
  le tableau de bord (`/admin`) et la liste des utilisateurs (`/admin/utilisateurs`), peut
  réinitialiser le mot de passe d'un élève.
- **Super administrateur** : mêmes droits qu'un administrateur, et peut promouvoir/rétrograder des
  comptes administrateurs.

## Mot de passe oublié

Aucun service d'email n'est configuré par défaut : le lien de réinitialisation est renvoyé
directement dans la réponse de `/api/auth/forgot-password` et affiché à l'écran, avec un
avertissement explicite. Pour un envoi par email réel en production, brancher un fournisseur
(Resend, SendGrid, etc.) dans cette route à la place du `devResetLink`.

## Modèle de calcul des moyennes

- Chaque note est ramenée sur /20 (`note × 20 / barème`) avant d'être moyennée au sein d'une
  matière.
- La **moyenne générale académique** pondère la moyenne de chaque matière par son coefficient.
- La **moyenne générale avec conduite** ajoute la note de conduite comme une matière de
  coefficient 1, pratique courante dans les bulletins ivoiriens pour le calcul du rang.
- La **moyenne annuelle** est la moyenne simple des moyennes des trimestres renseignés.
- Les appréciations (Félicitations, Encouragements, Tableau d'honneur, Passable, Avertissement,
  Blâme) suivent le barème habituel des bulletins de Côte d'Ivoire.
- Les conseils personnalisés priorisent les matières à fort coefficient et à moyenne faible,
  car ce sont elles qui offrent le meilleur gain sur la moyenne générale par point gagné.

## Structure du projet

```
scripts/schema.sql          Schéma Postgres (à appliquer via npm run db:migrate)
scripts/migrate.ts          Exécute schema.sql sur DATABASE_URL
scripts/seed.ts             Création du super administrateur
src/lib/db.ts               Connexion Supabase/Postgres, fonctions d'accès aux données
src/lib/auth.ts             Sessions (JWT en cookie httpOnly), hash de mot de passe, tokens de reset
src/lib/education.ts        Constantes du système éducatif ivoirien
src/lib/grades.ts           Calcul des moyennes et génération des suggestions
src/app/api/**              Routes API (inscription, connexion, profil, matières, notes, admin...)
src/app/(pages)             Pages : accueil, inscription, connexion, dashboard élève, admin
src/components/ui/UIProvider.tsx   Notifications (toasts) et confirmations en remplacement
                                    des alert()/confirm() natifs du navigateur
src/proxy.ts                 Protection des routes /dashboard, /admin, /profil (Next.js 16 : proxy)
```
