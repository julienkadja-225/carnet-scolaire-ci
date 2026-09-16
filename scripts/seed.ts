import bcrypt from "bcryptjs";
import { usersRepo } from "../src/lib/db.ts";

async function main() {
  const email = process.env.SUPERADMIN_EMAIL ?? "admin@carnet-ci.local";
  const password = process.env.SUPERADMIN_PASSWORD ?? "ChangeMoi123!";
  const fullName = process.env.SUPERADMIN_NAME ?? "Super Administrateur";

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    console.log(`Le super administrateur existe déjà : ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await usersRepo.create({
    fullName,
    email,
    passwordHash,
    role: "SUPERADMIN",
    status: "APPROVED",
    approvedAt: new Date().toISOString(),
  });

  console.log("Super administrateur créé :");
  console.log(`  Email : ${email}`);
  console.log(`  Mot de passe : ${password}`);
  console.log("  Pense à changer ce mot de passe après la première connexion.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
