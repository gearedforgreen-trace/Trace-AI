import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

async function main() {
  // Clean up any existing users first to allow fresh sign up
  await prisma.userTotalPoint.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user with proper password hashing compatible with Better Auth
  const adminPassword = await hashPassword('admin123');
  const adminUserId = ulid();
  
  const adminUser = await prisma.user.create({
    data: {
      id: adminUserId,
      email: 'admin@yopmail.com',
      name: 'Admin User',
      username: 'admin',
      displayUsername: 'Admin',
      emailVerified: true,
      role: 'admin',
      status: 'active',
    },
  });

  // Create the account record for password authentication
  await prisma.account.create({
    data: {
      id: `${adminUserId}-account`,
      accountId: adminUserId,
      providerId: 'credential',
      userId: adminUser.id,
      password: adminPassword,
    },
  });

  // Create test user 
  const testPassword = await hashPassword('test123');
  const testUserId = ulid();
  
  const testUser = await prisma.user.create({
    data: {
      id: testUserId,
      email: 'test@yopmail.com',
      name: 'Test User',
      username: 'testuser',
      displayUsername: 'Test User',
      emailVerified: true,
      role: 'user',
      status: 'active',
      phoneNumber: '+1-555-0123',
      address: '789 Elm Street, Portland',
      state: 'OR',
      postalCode: '97203',
    },
  });

  // Create the account record for test user
  await prisma.account.create({
    data: {
      id: `${testUserId}-account`,
      accountId: testUserId,
      providerId: 'credential',
      userId: testUser.id,
      password: testPassword,
    },
  });

  console.log('✅ Created admin user:');
  console.log('   Email: admin@yopmail.com');
  console.log('   Password: admin123');
  console.log('   Role: admin');
  console.log('');
  console.log('✅ Created test user:');
  console.log('   Email: test@yopmail.com'); 
  console.log('   Password: test123');
  console.log('   Role: user');
  console.log('');

  // Create test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
      logo: 'https://example.com/logo.png',
    },
  });

  // Create reward rules
  const rewardRules = [
    {
      id: ulid(),
      name: 'Plastic Bottle Points',
      description: 'Points for recycling plastic bottles',
      unitType: 'bottles',
      unit: 1,
      point: 10,
    },
    {
      id: ulid(),
      name: 'Aluminum Can Points',
      description: 'Points for recycling aluminum cans',
      unitType: 'cans',
      unit: 1,
      point: 5,
    },
    {
      id: ulid(),
      name: 'Paper Points',
      description: 'Points for recycling paper',
      unitType: 'pounds',
      unit: 1,
      point: 15,
    },
  ];

  const createdRewardRules = [];
  for (const rule of rewardRules) {
    const rewardRule = await prisma.rewardRules.upsert({
      where: { id: rule.id },
      update: {},
      create: rule,
    });
    createdRewardRules.push(rewardRule);
  }

  // Create materials
  const materials = [
    {
      id: ulid(),
      name: 'Plastic Bottles',
      description: 'PET plastic bottles and containers',
      rewardRuleId: createdRewardRules[0].id,
    },
    {
      id: ulid(),
      name: 'Aluminum Cans',
      description: 'Aluminum beverage cans',
      rewardRuleId: createdRewardRules[1].id,
    },
    {
      id: ulid(),
      name: 'Paper',
      description: 'Newspapers, magazines, and office paper',
      rewardRuleId: createdRewardRules[2].id,
    },
  ];

  const createdMaterials = [];
  for (const material of materials) {
    const mat = await prisma.material.upsert({
      where: { id: material.id },
      update: {},
      create: material,
    });
    createdMaterials.push(mat);
  }

  // Create test stores
  const stores = [
    {
      id: ulid(),
      name: 'Downtown Recycling Center',
      description: 'Main recycling facility in downtown area',
      organizationId: organization.id,
      address1: '123 Main St',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'US',
      lat: 45.5152,
      lng: -122.6784,
      status: 'ACTIVE' as const,
    },
    {
      id: ulid(),
      name: 'Westside Green Hub',
      description: 'Eco-friendly recycling station',
      organizationId: organization.id,
      address1: '456 Oak Ave',
      city: 'Portland',
      state: 'OR',
      zip: '97205',
      country: 'US',
      lat: 45.5230,
      lng: -122.7015,
      status: 'ACTIVE' as const,
    },
  ];

  const createdStores = [];
  for (const store of stores) {
    const st = await prisma.store.upsert({
      where: { id: store.id },
      update: {},
      create: store,
    });
    createdStores.push(st);
  }

  // Create bins for each store and material combination
  for (let i = 0; i < createdStores.length; i++) {
    const store = createdStores[i];
    for (let j = 0; j < createdMaterials.length; j++) {
      const material = createdMaterials[j];
      await prisma.bin.upsert({
        where: { id: `${store.id}-${material.id}` },
        update: {},
        create: {
          id: `${store.id}-${material.id}`,
          number: `BIN-${i + 1}-${j + 1}`,
          storeId: store.id,
          materialId: material.id,
          description: `${material.name} collection bin at ${store.name}`,
          status: 'ACTIVE' as const,
        },
      });
    }
  }

  // Create test coupons
  const coupons = [
    {
      id: ulid(),
      name: 'Summer Sale',
      description: 'Get 20% off on all items',
      couponType: 'PERCENTAGE' as const,
      dealType: 'POINTS' as const,
      discountAmount: 20,
      pointsToRedeem: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isFeatured: true,
      organizationId: organization.id,
      status: 'ACTIVE' as const,
    },
    {
      id: ulid(),
      name: 'Fixed Discount',
      description: 'Get $10 off on your purchase',
      couponType: 'FIXED' as const,
      dealType: 'NOPOINTS' as const,
      discountAmount: 10,
      pointsToRedeem: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isFeatured: false,
      organizationId: organization.id,
      status: 'ACTIVE' as const,
    },
    {
      id: ulid(),
      name: 'Eco Warrior Reward',
      description: 'Special discount for environmental champions',
      couponType: 'PERCENTAGE' as const,
      dealType: 'POINTS' as const,
      discountAmount: 25,
      pointsToRedeem: 200,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      isFeatured: true,
      organizationId: organization.id,
      status: 'ACTIVE' as const,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      update: {},
      create: coupon,
    });
  }

  // Create user total points for test user
  await prisma.userTotalPoint.create({
    data: {
      userId: testUser.id,
      totalPoints: 150,
    },
  });

  console.log('🌱 Database has been seeded successfully!');
  console.log('📧 You can now log in directly with the created users above.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 