-- =============================================================================
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

-- Bases (4)
INSERT INTO "bases" ("id", "name", "location", "created_at") VALUES ('99e23199-9889-4af7-98f2-51fb81eaa3ab', 'Camp North', 'Northern Operational Sector', '2026-09-25T09:51:07.291Z');
INSERT INTO "bases" ("id", "name", "location", "created_at") VALUES ('dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'Camp South', 'Southern Logistics Sector', '2026-09-25T09:51:07.574Z');
INSERT INTO "bases" ("id", "name", "location", "created_at") VALUES ('b0a63761-0beb-44e5-a396-8fc9a848fc0d', 'Central Depot', 'Central Reserve Ordnance Hub', '2026-09-25T09:51:07.680Z');
INSERT INTO "bases" ("id", "name", "location", "created_at") VALUES ('f17fea51-88d3-4ed7-817b-6e40434062f7', 'Airbase East', 'Eastern Tactical Air Command', '2026-09-25T09:51:07.751Z');

-- Equipment Types (6)
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('cd55e4a4-dff2-4761-b426-b408827b8001', 'Rifle 7.62mm', 'WEAPON', 'pcs');
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('fa94536c-c876-4476-b712-b27675f43f71', 'Armored Vehicle', 'VEHICLE', 'units');
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('17ea4e52-84e8-4584-821d-ebc98a910bda', '7.62mm Ammunition', 'AMMUNITION', 'rounds');
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('c4a0ac51-5b98-4638-ad4a-c7321cccc522', 'Diesel Fuel', 'SUPPLY', 'litres');
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('f9894348-f239-433b-b86e-b9fdd6f4f7cb', 'Night Vision Goggles', 'SUPPLY', 'sets');
INSERT INTO "equipment_types" ("id", "name", "category", "unit") VALUES ('5a7ebb7b-d490-4584-9bc8-021d2246aa50', 'Artillery Shell 155mm', 'AMMUNITION', 'rounds');

-- Users (4)
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "base_id", "is_active", "created_at", "updated_at") VALUES ('32749a1f-f364-4b7d-8867-fc7840ca06e6', 'General V. Sharma', 'admin@forces.gov', '$2a$10$OivhyqZ5d03ptsIo.IUTOushf81gE0yR9JRpbuovY9ItsgCJxtAoW', 'ADMIN', NULL, TRUE, '2026-09-25T09:51:09.052Z', '2026-09-25T09:51:09.052Z');
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "base_id", "is_active", "created_at", "updated_at") VALUES ('3dc17afb-ba20-4ed4-ae68-bf963e94909e', 'Col. R. Singh', 'cmdr.north@forces.gov', '$2a$10$JEUyF9MYT6IwEBPv/Lg9Me7Zc8X0ojRtQ6moITcdI49lZshp.ZcVq', 'BASE_COMMANDER', '99e23199-9889-4af7-98f2-51fb81eaa3ab', TRUE, '2026-09-25T09:51:09.315Z', '2026-09-25T09:51:09.315Z');
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "base_id", "is_active", "created_at", "updated_at") VALUES ('62e0831a-cb77-4eaf-abb2-23df3939a42b', 'Col. K. Menon', 'cmdr.south@forces.gov', '$2a$10$JEUyF9MYT6IwEBPv/Lg9Me7Zc8X0ojRtQ6moITcdI49lZshp.ZcVq', 'BASE_COMMANDER', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', TRUE, '2026-09-25T09:51:09.443Z', '2026-09-25T09:51:09.443Z');
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "base_id", "is_active", "created_at", "updated_at") VALUES ('4e776548-24b4-4ceb-aaff-5ba64a6c2b15', 'Maj. A. Patel', 'logistics@forces.gov', '$2a$10$8naxFzgO4haXff80AVODhubuwTo5jsr4cubGz1.guZh/SWJTz0RMe', 'LOGISTICS_OFFICER', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', TRUE, '2026-09-25T09:51:09.521Z', '2026-09-25T09:51:09.521Z');

-- Stock Balances (17)
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('2f87b008-02e8-4256-a98e-407e2150c2cc', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'fa94536c-c876-4476-b712-b27675f43f71', 24, '2026-09-25T09:51:09.827Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('25d42075-7770-45c9-a45f-fe6036c7f1e0', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'c4a0ac51-5b98-4638-ad4a-c7321cccc522', 30000, '2026-09-25T09:51:10.036Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('ebc376a3-d95d-41b7-912d-0f552060ac2d', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'f9894348-f239-433b-b86e-b9fdd6f4f7cb', 180, '2026-09-25T09:51:10.088Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('0fdb390c-a069-42fe-b364-0669d35f379f', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'fa94536c-c876-4476-b712-b27675f43f71', 18, '2026-09-25T09:51:10.309Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('0b44d11e-fc93-451a-88d9-8d9215bfa50b', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', '17ea4e52-84e8-4584-821d-ebc98a910bda', 50000, '2026-09-25T09:51:10.369Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('b55847d9-d725-4f10-9a9c-66c074a339df', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'c4a0ac51-5b98-4638-ad4a-c7321cccc522', 20000, '2026-09-25T09:51:10.545Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('1e67dd40-9e24-4e16-9e5b-20d5fddfae59', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', 'cd55e4a4-dff2-4761-b426-b408827b8001', 1500, '2026-09-25T09:51:10.649Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('719522b5-241d-48d9-bff0-771ce0e2cf03', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', 'fa94536c-c876-4476-b712-b27675f43f71', 60, '2026-09-25T09:51:10.748Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('a34ad238-ae57-48f0-9fad-14fdaf49c324', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', '17ea4e52-84e8-4584-821d-ebc98a910bda', 300000, '2026-09-25T09:51:10.799Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('9f9a68e8-7fd1-4787-941d-86d303c23485', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', '5a7ebb7b-d490-4584-9bc8-021d2246aa50', 4200, '2026-09-25T09:51:10.848Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('2c9552d4-619b-44f1-bd05-1d1efe13d7e9', 'f17fea51-88d3-4ed7-817b-6e40434062f7', 'cd55e4a4-dff2-4761-b426-b408827b8001', 210, '2026-09-25T09:51:10.898Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('0f6a7e91-a930-4d79-882b-30100d830620', 'f17fea51-88d3-4ed7-817b-6e40434062f7', 'c4a0ac51-5b98-4638-ad4a-c7321cccc522', 95000, '2026-09-25T09:51:11.055Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('0371e590-c32e-491a-8158-30d7827678e1', '99e23199-9889-4af7-98f2-51fb81eaa3ab', '17ea4e52-84e8-4584-821d-ebc98a910bda', 85005, '2026-09-25T09:53:57.666Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('60a132ce-ae5f-4663-90d2-3fc1f5494838', 'f17fea51-88d3-4ed7-817b-6e40434062f7', '17ea4e52-84e8-4584-821d-ebc98a910bda', 5, '2026-09-25T09:54:39.246Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('b236712d-29b4-47fe-a930-128be47a67e6', 'f17fea51-88d3-4ed7-817b-6e40434062f7', '5a7ebb7b-d490-4584-9bc8-021d2246aa50', 22, '2026-09-25T09:55:27.986Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('b97ef227-f55f-4575-ac20-ebbdcd7d8661', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 925, '2026-09-25T10:02:32.140Z');
INSERT INTO "stock_balances" ("id", "base_id", "equipment_type_id", "quantity", "updated_at") VALUES ('0d3e58a9-7efc-4aae-9415-84af8f0aee07', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'cd55e4a4-dff2-4761-b426-b408827b8001', 345, '2026-09-25T10:02:32.304Z');

-- Purchases (6)
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('e1c00f4e-30d4-4168-b9f0-a1583bfa0588', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 50, 1200, 'Ordnance Factory Board (OFB)', '2026-09-10T00:00:00.000Z', 'Standard infantry issue batch', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '2026-09-25T09:51:11.156Z');
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('d4e71306-64a3-45f4-b823-8234e26ac839', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', '17ea4e52-84e8-4584-821d-ebc98a910bda', 20000, 0.85, 'Bharat Dynamics Limited', '2026-09-15T00:00:00.000Z', 'Strategic stockpile reserve replenishment', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '2026-09-25T09:51:11.367Z');
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('abf601e5-2039-4ab3-af0a-9121aebcb1be', '99e23199-9889-4af7-98f2-51fb81eaa3ab', '17ea4e52-84e8-4584-821d-ebc98a910bda', 5, 1200, 'dfs', '2026-09-25T00:00:00.000Z', '', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:53:56.950Z');
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('635fb94b-7110-4c1f-959a-eed80954002b', 'f17fea51-88d3-4ed7-817b-6e40434062f7', '17ea4e52-84e8-4584-821d-ebc98a910bda', 5, 40000, 'gg', '2026-09-25T00:00:00.000Z', '', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:54:38.221Z');
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('50eea0ef-1868-48a8-9654-49eb5628730a', 'f17fea51-88d3-4ed7-817b-6e40434062f7', '5a7ebb7b-d490-4584-9bc8-021d2246aa50', 22, 500000, 'fff', '2026-09-25T00:00:00.000Z', '', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:55:27.269Z');
INSERT INTO "purchases" ("id", "base_id", "equipment_type_id", "quantity", "unit_price", "supplier", "purchase_date", "notes", "recorded_by_id", "created_at") VALUES ('4e8cf41d-288d-44e9-b3f2-a7c0c250b540', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 500, 1150, 'Indian Ordnance Factories Board', '2026-09-25T09:59:17.858Z', 'Test Verification Batch - Live Audit', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:59:18.088Z');

-- Transfers (3)
INSERT INTO "transfers" ("id", "from_base_id", "to_base_id", "equipment_type_id", "quantity", "status", "notes", "initiated_by_id", "approved_by_id", "created_at", "updated_at", "completed_at") VALUES ('cb5799d2-4dd1-49f0-bdb8-15c1749dfc72', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 30, 'COMPLETED', 'Northern Sector Border Reinforcement', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-25T09:51:11.469Z', '2026-09-25T09:51:11.469Z', '2026-09-18T00:00:00.000Z');
INSERT INTO "transfers" ("id", "from_base_id", "to_base_id", "equipment_type_id", "quantity", "status", "notes", "initiated_by_id", "approved_by_id", "created_at", "updated_at", "completed_at") VALUES ('d07525a8-77a2-4add-9088-f0ee7550ec9a', 'b0a63761-0beb-44e5-a396-8fc9a848fc0d', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'fa94536c-c876-4476-b712-b27675f43f71', 4, 'APPROVED', 'Tactical Reconnaissance Vehicles', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:51:12.595Z', '2026-09-25T09:51:12.595Z', NULL);
INSERT INTO "transfers" ("id", "from_base_id", "to_base_id", "equipment_type_id", "quantity", "status", "notes", "initiated_by_id", "approved_by_id", "created_at", "updated_at", "completed_at") VALUES ('3cfaf252-f181-4875-8379-4df277fc6b96', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'dc740362-e913-4d04-83a9-b0e2bfedfb0a', 'cd55e4a4-dff2-4761-b426-b408827b8001', 25, 'COMPLETED', 'Strategic Redistribution', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:29.275Z', '2026-09-25T10:02:32.423Z', '2026-09-25T10:02:32.422Z');

-- Transfer Events (8)
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('3429e350-84df-4b96-9ab0-8da273ffd4c9', 'cb5799d2-4dd1-49f0-bdb8-15c1749dfc72', 'PENDING', 'Transfer initiated from Depot', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '2026-09-25T09:51:11.469Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('399888d0-de8a-43b7-acbb-baea3d606e01', 'cb5799d2-4dd1-49f0-bdb8-15c1749dfc72', 'APPROVED', 'Approved by Camp North Commander', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-25T09:51:11.469Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('c12338fc-2cb3-40ec-85e7-fab524d2bae7', 'cb5799d2-4dd1-49f0-bdb8-15c1749dfc72', 'COMPLETED', 'Consignment received at destination', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-25T09:51:11.469Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('54e2a916-8a49-4b35-8749-51e99f87c6fe', 'd07525a8-77a2-4add-9088-f0ee7550ec9a', 'PENDING', 'Transfer initiated', '4e776548-24b4-4ceb-aaff-5ba64a6c2b15', '2026-09-25T09:51:12.595Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('eb561856-77c0-4fbb-a9cc-4f7d058588d4', 'd07525a8-77a2-4add-9088-f0ee7550ec9a', 'APPROVED', 'Approved by HQ Directorate', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T09:51:12.595Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('507d71a8-698f-4034-8ddf-2bd6b20eae23', '3cfaf252-f181-4875-8379-4df277fc6b96', 'PENDING', 'Transfer request submitted', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:29.275Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('14bfcadf-4f42-427f-a268-83dcdd018b49', '3cfaf252-f181-4875-8379-4df277fc6b96', 'APPROVED', 'Transfer approved by commanding officer', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:31.015Z');
INSERT INTO "transfer_events" ("id", "transfer_id", "status", "note", "actor_id", "created_at") VALUES ('fe1362fc-96cf-485f-aad9-7232f7d90930', '3cfaf252-f181-4875-8379-4df277fc6b96', 'COMPLETED', 'Consignment verified and stock credited to destination base', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:32.423Z');

-- Assignments (3)
INSERT INTO "assignments" ("id", "base_id", "equipment_type_id", "personnel_name", "personnel_id", "quantity", "status", "assigned_by_id", "assigned_at", "returned_at", "notes") VALUES ('44636b1e-ec33-4df6-a4fb-10a76b65914b', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 'Subedar M. Rawat', 'MIL-89102', 1, 'ACTIVE', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-20T00:00:00.000Z', NULL, 'Patrol Duty Section A');
INSERT INTO "assignments" ("id", "base_id", "equipment_type_id", "personnel_name", "personnel_id", "quantity", "status", "assigned_by_id", "assigned_at", "returned_at", "notes") VALUES ('7f0abcac-dbff-4ce8-a13b-de711af95eae', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'f9894348-f239-433b-b86e-b9fdd6f4f7cb', 'Havildar S. Kumar', 'MIL-90311', 1, 'ACTIVE', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-21T00:00:00.000Z', NULL, 'Night surveillance watch');
INSERT INTO "assignments" ("id", "base_id", "equipment_type_id", "personnel_name", "personnel_id", "quantity", "status", "assigned_by_id", "assigned_at", "returned_at", "notes") VALUES ('6f501eff-4328-4960-91e2-a70487b99b9f', '99e23199-9889-4af7-98f2-51fb81eaa3ab', 'cd55e4a4-dff2-4761-b426-b408827b8001', 'Naik R. K. Sharma', 'MIL-77881', 5, 'RETURNED', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:24.465Z', '2026-09-25T10:02:26.096Z', 'Tactical Recon Patrol');

-- Expenditures (2)
INSERT INTO "expenditures" ("id", "base_id", "equipment_type_id", "quantity", "reason", "expended_by_id", "expended_at") VALUES ('c331c09a-368a-4910-a5ce-b83072a40303', '99e23199-9889-4af7-98f2-51fb81eaa3ab', '17ea4e52-84e8-4584-821d-ebc98a910bda', 1200, 'Live-fire range qualification drill', '3dc17afb-ba20-4ed4-ae68-bf963e94909e', '2026-09-22T00:00:00.000Z');
INSERT INTO "expenditures" ("id", "base_id", "equipment_type_id", "quantity", "reason", "expended_by_id", "expended_at") VALUES ('3d9b51e1-2918-4d0b-9c95-2ed18ab67f55', '99e23199-9889-4af7-98f2-51fb81eaa3ab', '17ea4e52-84e8-4584-821d-ebc98a910bda', 350, 'Long Range Marksmanship Training', '32749a1f-f364-4b7d-8867-fc7840ca06e6', '2026-09-25T10:02:27.330Z');

