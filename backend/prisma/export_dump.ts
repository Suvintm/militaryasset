import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportDump() {
  console.log('Generating complete database dump...');

  let sql = `-- =============================================================================
-- Military Asset Management System (MAMS) - Complete PostgreSQL Database Dump
-- Ministry of Defence, Govt. of India
-- Schema, Tables, Constraints, and Seed Data
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types if necessary
DROP TABLE IF EXISTS "refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "expenditures" CASCADE;
DROP TABLE IF EXISTS "assignments" CASCADE;
DROP TABLE IF EXISTS "transfer_events" CASCADE;
DROP TABLE IF EXISTS "transfers" CASCADE;
DROP TABLE IF EXISTS "purchases" CASCADE;
DROP TABLE IF EXISTS "stock_balances" CASCADE;
DROP TABLE IF EXISTS "equipment_types" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "bases" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "TransferStatus" CASCADE;
DROP TYPE IF EXISTS "AssignmentStatus" CASCADE;
DROP TYPE IF EXISTS "AuditAction" CASCADE;

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- Tables
CREATE TABLE "bases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "equipment_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'units'
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LOGISTICS_OFFICER',
    "base_id" TEXT REFERENCES "bases"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "stock_balances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "equipment_type_id" TEXT NOT NULL REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_balances_base_equipment_uniq" UNIQUE ("base_id", "equipment_type_id")
);

CREATE TABLE "purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "equipment_type_id" TEXT NOT NULL REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "supplier" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "recorded_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "from_base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "to_base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "equipment_type_id" TEXT NOT NULL REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "initiated_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "approved_by_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3)
);

CREATE TABLE "transfer_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transfer_id" TEXT NOT NULL REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "status" "TransferStatus" NOT NULL,
    "note" TEXT,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "equipment_type_id" TEXT NOT NULL REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "personnel_name" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "notes" TEXT
);

CREATE TABLE "expenditures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "base_id" TEXT NOT NULL REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "equipment_type_id" TEXT NOT NULL REFERENCES "equipment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "expended_by_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "expended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "method" TEXT,
    "path" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "payload_before" JSONB,
    "payload_after" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- =============================================================================
-- DATA INSERTS
-- =============================================================================

`;

  const escapeStr = (val: any) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (val instanceof Date) return `'${val.toISOString()}'`;
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    return `'${val.toString().replace(/'/g, "''")}'`;
  };

  // 1. Bases
  const bases = await prisma.base.findMany();
  if (bases.length > 0) {
    sql += `-- Bases (${bases.length})\n`;
    for (const b of bases) {
      sql += `INSERT INTO "bases" ("id", "name", "location", "created_at") VALUES (${escapeStr(b.id)}, ${escapeStr(b.name)}, ${escapeStr(b.location)}, ${escapeStr(b.createdAt)});\n`;
    }
    sql += '\n';
  }

  // 2. Equipment Types
  const eq = await prisma.equipmentType.findMany();
  if (eq.length > 0) {
    sql += `-- Equipment Types (${eq.length})\n`;
    for (const e of eq) {
      sql += `INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES (${escapeStr(e.id)}, ${escapeStr(e.name)}, ${escapeStr(e.category)}, ${escapeStr(e.unit)});\n`;
    }
    sql += '\n';
  }

  // 3. Users
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    sql += `-- Users (${users.length})\n`;
    for (const u of users) {
      sql += `INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "base_id", "is_active", "created_at", "updated_at") VALUES (${escapeStr(u.id)}, ${escapeStr(u.name)}, ${escapeStr(u.email)}, ${escapeStr(u.passwordHash)}, '${u.role}', ${escapeStr(u.baseId)}, ${escapeStr(u.isActive)}, ${escapeStr(u.createdAt)}, ${escapeStr(u.updatedAt)});\n`;
    }
    sql += '\n';
  }

  // 4. Stock Balances
  const stocks = await prisma.stockBalance.findMany();
  if (stocks.length > 0) {
    sql += `-- Stock Balances (${stocks.length})\n`;
    for (const s of stocks) {
      sql += `INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES (${escapeStr(s.id)}, ${escapeStr(s.baseId)}, ${escapeStr(s.equipmentTypeId)}, ${s.quantity}, ${escapeStr(s.updatedAt)});\n`;
    }
    sql += '\n';
  }

  // 5. Purchases
  const purchases = await prisma.purchase.findMany();
  if (purchases.length > 0) {
    sql += `-- Purchases (${purchases.length})\n`;
    for (const p of purchases) {
      sql += `INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES (${escapeStr(p.id)}, ${escapeStr(p.baseId)}, ${escapeStr(p.equipmentTypeId)}, ${p.quantity}, ${p.unitPrice}, ${escapeStr(p.supplier)}, ${escapeStr(p.purchaseDate)}, ${escapeStr(p.notes)}, ${escapeStr(p.recordedById)}, ${escapeStr(p.createdAt)});\n`;
    }
    sql += '\n';
  }

  // 6. Transfers
  const transfers = await prisma.transfer.findMany();
  if (transfers.length > 0) {
    sql += `-- Transfers (${transfers.length})\n`;
    for (const t of transfers) {
      sql += `INSERT INTO "transfers" ("id", "from_base_id", "to_base_id", "equipment_type_id", "quantity", "status", "notes", "initiated_by_id", "approved_by_id", "created_at", "updated_at", "completed_at") VALUES (${escapeStr(t.id)}, ${escapeStr(t.fromBaseId)}, ${escapeStr(t.toBaseId)}, ${escapeStr(t.equipmentTypeId)}, ${t.quantity}, '${t.status}', ${escapeStr(t.notes)}, ${escapeStr(t.initiatedById)}, ${escapeStr(t.approvedById)}, ${escapeStr(t.createdAt)}, ${escapeStr(t.updatedAt)}, ${escapeStr(t.completedAt)});\n`;
    }
    sql += '\n';
  }

  // 7. Transfer Events
  const events = await prisma.transferEvent.findMany();
  if (events.length > 0) {
    sql += `-- Transfer Events (${events.length})\n`;
    for (const ev of events) {
      sql += `INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES (${escapeStr(ev.id)}, ${escapeStr(ev.transferId)}, '${ev.status}', ${escapeStr(ev.note)}, ${escapeStr(ev.actorId)}, ${escapeStr(ev.createdAt)});\n`;
    }
    sql += '\n';
  }

  // 8. Assignments
  const assignments = await prisma.assignment.findMany();
  if (assignments.length > 0) {
    sql += `-- Assignments (${assignments.length})\n`;
    for (const a of assignments) {
      sql += `INSERT INTO "assignments" ("id", "base_id", "equipment_type_id", "personnel_name", "personnel_id", "quantity", "status", "assigned_by_id", "assigned_at", "returned_at", "notes") VALUES (${escapeStr(a.id)}, ${escapeStr(a.baseId)}, ${escapeStr(a.equipmentTypeId)}, ${escapeStr(a.personnelName)}, ${escapeStr(a.personnelId)}, ${a.quantity}, '${a.status}', ${escapeStr(a.assignedById)}, ${escapeStr(a.assignedAt)}, ${escapeStr(a.returnedAt)}, ${escapeStr(a.notes)});\n`;
    }
    sql += '\n';
  }

  // 9. Expenditures
  const expenditures = await prisma.expenditure.findMany();
  if (expenditures.length > 0) {
    sql += `-- Expenditures (${expenditures.length})\n`;
    for (const ex of expenditures) {
      sql += `INSERT INTO "expenditures" ("id", "base_id", "equipment_type_id", "quantity", "reason", "expended_by_id", "expended_at") VALUES (${escapeStr(ex.id)}, ${escapeStr(ex.baseId)}, ${escapeStr(ex.equipmentTypeId)}, ${ex.quantity}, ${escapeStr(ex.reason)}, ${escapeStr(ex.expendedById)}, ${escapeStr(ex.expendedAt)});\n`;
    }
    sql += '\n';
  }

  const dumpPath = path.resolve(__dirname, '../../database_dump.sql');
  fs.writeFileSync(dumpPath, sql, 'utf-8');
  console.log(`Database dump successfully created at: ${dumpPath}`);
  await prisma.$disconnect();
}

exportDump().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
