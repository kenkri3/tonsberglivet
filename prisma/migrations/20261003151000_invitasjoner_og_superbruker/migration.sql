-- Superbruker: eiernivået over administrator.
--
-- MERK: PostgreSQL tillater «ALTER TYPE ... ADD VALUE» inne i en transaksjon,
-- men den nye verdien kan ikke BRUKES før transaksjonen er committet. Denne
-- migrasjonen legger derfor bare til verdien – ingen rad oppdateres til
-- SUPERADMIN her. Det gjøres etterpå, av applikasjonen eller manuelt.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

-- Invitasjoner til nye medarbeidere. Passordet settes av den inviterte selv på
-- /invitasjon/<token>. Vi lagrer bare et SHA-256-fingeravtrykk av tokenen, slik
-- at en som leser databasen ikke kan bruke en utestående invitasjon.
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "title" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "tokenHash" TEXT NOT NULL,
    "note" TEXT,
    "invitedById" TEXT,
    "invitedByName" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");

ALTER TABLE "Invitation"
    ADD CONSTRAINT "Invitation_invitedById_fkey"
    FOREIGN KEY ("invitedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
