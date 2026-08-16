import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { Role } from '../entities/role.entity';
import { SuperAdminUser } from '../entities/super-admin-user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { BillingCycle } from '../entities/enums';

const ROLE_DEFINITIONS = [
  {
    name: 'SUPER_ADMIN',
    description: 'Full access to every module in the Super Admin Portal.',
    permissions: ['*'],
  },
  {
    name: 'SUPPORT_AGENT',
    description: 'Read-only access, plus the ability to assist tenants.',
    permissions: ['dashboard.read', 'tenants.read', 'billing.read'],
  },
  {
    name: 'BILLING_ADMIN',
    description: 'Manages subscription plans, invoices, and tenant billing.',
    permissions: [
      'dashboard.read',
      'tenants.read',
      'billing.read',
      'billing.write',
    ],
  },
];

const PLAN_DEFINITIONS = [
  {
    name: 'Starter',
    code: 'STARTER_MONTHLY',
    price: '49.00',
    billingCycle: BillingCycle.MONTHLY,
    maxUsers: 10,
    maxBranches: 1,
    features: ['Up to 10 users', '1 branch', 'Email support'],
  },
  {
    name: 'Growth',
    code: 'GROWTH_MONTHLY',
    price: '149.00',
    billingCycle: BillingCycle.MONTHLY,
    maxUsers: 50,
    maxBranches: 5,
    features: [
      'Up to 50 users',
      'Up to 5 branches',
      'Priority support',
      'AI document extraction',
    ],
  },
  {
    name: 'Enterprise',
    code: 'ENTERPRISE_MONTHLY',
    price: '399.00',
    billingCycle: BillingCycle.MONTHLY,
    maxUsers: 500,
    maxBranches: 50,
    features: [
      'Unlimited users*',
      'Unlimited branches*',
      'Dedicated support',
      'Custom integrations',
    ],
  },
];

async function seed() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(SuperAdminUser);
  const planRepo = AppDataSource.getRepository(SubscriptionPlan);

  console.log('Seeding roles...');
  const roles: Record<string, Role> = {};
  for (const def of ROLE_DEFINITIONS) {
    let role = await roleRepo.findOne({ where: { name: def.name } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create(def));
      console.log(`  created role ${def.name}`);
    }
    roles[def.name] = role;
  }

  console.log('Seeding subscription plans...');
  for (const def of PLAN_DEFINITIONS) {
    const existing = await planRepo.findOne({ where: { code: def.code } });
    if (!existing) {
      await planRepo.save(planRepo.create(def));
      console.log(`  created plan ${def.name}`);
    }
  }

  const seedEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@example.com';
  const existingAdmin = await userRepo.findOne({ where: { email: seedEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(
      process.env.SEED_SUPER_ADMIN_PASSWORD || 'ChangeMe123!',
      12,
    );
    await userRepo.save(
      userRepo.create({
        fullName: process.env.SEED_SUPER_ADMIN_NAME || 'Super Admin',
        email: seedEmail,
        passwordHash,
        roleId: roles['SUPER_ADMIN'].id,
      }),
    );
    console.log(`Created initial super admin: ${seedEmail}`);
    console.log('   IMPORTANT: log in and change this password immediately.');
  } else {
    console.log(`Super admin ${seedEmail} already exists, skipping.`);
  }

  await AppDataSource.destroy();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
