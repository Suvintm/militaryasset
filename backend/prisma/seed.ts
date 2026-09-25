import { PrismaClient, Role, TransferStatus, AssignmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous data ---');
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.transferEvent.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.stockBalance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  console.log('--- Seeding Bases ---');
  const campNorth = await prisma.base.create({
    data: { name: 'Camp North', location: 'Northern Operational Sector' },
  });

  const campSouth = await prisma.base.create({
    data: { name: 'Camp South', location: 'Southern Logistics Sector' },
  });

  const centralDepot = await prisma.base.create({
    data: { name: 'Central Depot', location: 'Central Reserve Ordnance Hub' },
  });

  const airbaseEast = await prisma.base.create({
    data: { name: 'Airbase East', location: 'Eastern Tactical Air Command' },
  });

  console.log('--- Seeding Equipment Types ---');
  const rifle = await prisma.equipmentType.create({
    data: { name: 'Rifle 7.62mm', category: 'WEAPON', unit: 'pcs' },
  });

  const armoredVehicle = await prisma.equipmentType.create({
    data: { name: 'Armored Vehicle', category: 'VEHICLE', unit: 'units' },
  });

  const ammo762 = await prisma.equipmentType.create({
    data: { name: '7.62mm Ammunition', category: 'AMMUNITION', unit: 'rounds' },
  });

  const fuelDiesel = await prisma.equipmentType.create({
    data: { name: 'Diesel Fuel', category: 'SUPPLY', unit: 'litres' },
  });

  const nvg = await prisma.equipmentType.create({
    data: { name: 'Night Vision Goggles', category: 'SUPPLY', unit: 'sets' },
  });

  const artillery155 = await prisma.equipmentType.create({
    data: { name: 'Artillery Shell 155mm', category: 'AMMUNITION', unit: 'rounds' },
  });

  console.log('--- Seeding Users (with pre-hashed passwords) ---');
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const cmdrPass = await bcrypt.hash('Cmdr@123', 10);
  const logPass = await bcrypt.hash('Logistics@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'General V. Sharma',
      email: 'admin@forces.gov',
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  });

  const cmdrNorth = await prisma.user.create({
    data: {
      name: 'Col. R. Singh',
      email: 'cmdr.north@forces.gov',
      passwordHash: cmdrPass,
      role: Role.BASE_COMMANDER,
      baseId: campNorth.id,
    },
  });

  const cmdrSouth = await prisma.user.create({
    data: {
      name: 'Col. K. Menon',
      email: 'cmdr.south@forces.gov',
      passwordHash: cmdrPass,
      role: Role.BASE_COMMANDER,
      baseId: campSouth.id,
    },
  });

  const logistics = await prisma.user.create({
    data: {
      name: 'Maj. A. Patel',
      email: 'logistics@forces.gov',
      passwordHash: logPass,
      role: Role.LOGISTICS_OFFICER,
      baseId: centralDepot.id,
    },
  });

  console.log('--- Seeding Initial Stock Balances ---');
  // Camp North Stocks
  await prisma.stockBalance.create({ data: { baseId: campNorth.id, equipmentTypeId: rifle.id, quantity: 450 } });
  await prisma.stockBalance.create({ data: { baseId: campNorth.id, equipmentTypeId: armoredVehicle.id, quantity: 24 } });
  await prisma.stockBalance.create({ data: { baseId: campNorth.id, equipmentTypeId: ammo762.id, quantity: 85000 } });
  await prisma.stockBalance.create({ data: { baseId: campNorth.id, equipmentTypeId: fuelDiesel.id, quantity: 30000 } });
  await prisma.stockBalance.create({ data: { baseId: campNorth.id, equipmentTypeId: nvg.id, quantity: 180 } });

  // Camp South Stocks
  await prisma.stockBalance.create({ data: { baseId: campSouth.id, equipmentTypeId: rifle.id, quantity: 320 } });
  await prisma.stockBalance.create({ data: { baseId: campSouth.id, equipmentTypeId: armoredVehicle.id, quantity: 18 } });
  await prisma.stockBalance.create({ data: { baseId: campSouth.id, equipmentTypeId: ammo762.id, quantity: 50000 } });
  await prisma.stockBalance.create({ data: { baseId: campSouth.id, equipmentTypeId: fuelDiesel.id, quantity: 20000 } });

  // Central Depot Stocks
  await prisma.stockBalance.create({ data: { baseId: centralDepot.id, equipmentTypeId: rifle.id, quantity: 1500 } });
  await prisma.stockBalance.create({ data: { baseId: centralDepot.id, equipmentTypeId: armoredVehicle.id, quantity: 60 } });
  await prisma.stockBalance.create({ data: { baseId: centralDepot.id, equipmentTypeId: ammo762.id, quantity: 300000 } });
  await prisma.stockBalance.create({ data: { baseId: centralDepot.id, equipmentTypeId: artillery155.id, quantity: 4200 } });

  // Airbase East Stocks
  await prisma.stockBalance.create({ data: { baseId: airbaseEast.id, equipmentTypeId: rifle.id, quantity: 210 } });
  await prisma.stockBalance.create({ data: { baseId: airbaseEast.id, equipmentTypeId: fuelDiesel.id, quantity: 95000 } });

  console.log('--- Seeding Sample Purchases ---');
  await prisma.purchase.create({
    data: {
      baseId: campNorth.id,
      equipmentTypeId: rifle.id,
      quantity: 50,
      unitPrice: 1200.0,
      supplier: 'Ordnance Factory Board (OFB)',
      purchaseDate: new Date('2026-09-10'),
      notes: 'Standard infantry issue batch',
      recordedById: logistics.id,
    },
  });

  await prisma.purchase.create({
    data: {
      baseId: centralDepot.id,
      equipmentTypeId: ammo762.id,
      quantity: 20000,
      unitPrice: 0.85,
      supplier: 'Bharat Dynamics Limited',
      purchaseDate: new Date('2026-09-15'),
      notes: 'Strategic stockpile reserve replenishment',
      recordedById: logistics.id,
    },
  });

  console.log('--- Seeding Sample Transfers & Events ---');
  const transfer1 = await prisma.transfer.create({
    data: {
      fromBaseId: centralDepot.id,
      toBaseId: campNorth.id,
      equipmentTypeId: rifle.id,
      quantity: 30,
      status: TransferStatus.COMPLETED,
      notes: 'Northern Sector Border Reinforcement',
      initiatedById: logistics.id,
      approvedById: cmdrNorth.id,
      completedAt: new Date('2026-09-18'),
      events: {
        create: [
          { status: TransferStatus.PENDING, note: 'Transfer initiated from Depot', actorId: logistics.id },
          { status: TransferStatus.APPROVED, note: 'Approved by Camp North Commander', actorId: cmdrNorth.id },
          { status: TransferStatus.COMPLETED, note: 'Consignment received at destination', actorId: cmdrNorth.id },
        ],
      },
    },
  });

  const transfer2 = await prisma.transfer.create({
    data: {
      fromBaseId: centralDepot.id,
      toBaseId: campSouth.id,
      equipmentTypeId: armoredVehicle.id,
      quantity: 4,
      status: TransferStatus.APPROVED,
      notes: 'Tactical Reconnaissance Vehicles',
      initiatedById: logistics.id,
      approvedById: admin.id,
      events: {
        create: [
          { status: TransferStatus.PENDING, note: 'Transfer initiated', actorId: logistics.id },
          { status: TransferStatus.APPROVED, note: 'Approved by HQ Directorate', actorId: admin.id },
        ],
      },
    },
  });

  console.log('--- Seeding Sample Assignments ---');
  await prisma.assignment.create({
    data: {
      baseId: campNorth.id,
      equipmentTypeId: rifle.id,
      personnelName: 'Subedar M. Rawat',
      personnelId: 'MIL-89102',
      quantity: 1,
      status: AssignmentStatus.ACTIVE,
      assignedById: cmdrNorth.id,
      assignedAt: new Date('2026-09-20'),
      notes: 'Patrol Duty Section A',
    },
  });

  await prisma.assignment.create({
    data: {
      baseId: campNorth.id,
      equipmentTypeId: nvg.id,
      personnelName: 'Havildar S. Kumar',
      personnelId: 'MIL-90311',
      quantity: 1,
      status: AssignmentStatus.ACTIVE,
      assignedById: cmdrNorth.id,
      assignedAt: new Date('2026-09-21'),
      notes: 'Night surveillance watch',
    },
  });

  console.log('--- Seeding Sample Expenditures ---');
  await prisma.expenditure.create({
    data: {
      baseId: campNorth.id,
      equipmentTypeId: ammo762.id,
      quantity: 1200,
      reason: 'Live-fire range qualification drill',
      expendedById: cmdrNorth.id,
      expendedAt: new Date('2026-09-22'),
    },
  });

  console.log('--- Seeding Audit Logs ---');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'LOGIN',
      entityType: 'AUTH',
      method: 'POST',
      path: '/api/v1/auth/login',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
