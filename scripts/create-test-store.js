// This script adds a test store to a specified organization
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const organizationId = '30822571-5aa5-4c1e-8340-c1c0baf04133';
  
  // First check if the organization exists
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId
    }
  });
  
  if (!organization) {
    console.log('Creating test organization...');
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Test Organization',
        slug: 'test-organization'
      }
    });
    console.log('Organization created successfully!');
  } else {
    console.log('Organization exists:', organization.name);
  }
  
  // Check if there are any stores for this organization
  const storeCount = await prisma.store.count({
    where: {
      organizationId
    }
  });
  
  if (storeCount === 0) {
    console.log('Creating test store...');
    
    // Create a test store for this organization
    const store = await prisma.store.create({
      data: {
        name: 'Test Store',
        description: 'A test store for development',
        status: 'ACTIVE',
        organizationId,
        address1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'Test Country',
        lat: 37.7749, // Example coordinates (San Francisco)
        lng: -122.4194
      }
    });
    
    console.log('Store created successfully:', store);
  } else {
    console.log(`${storeCount} stores already exist for this organization.`);
    
    // Show the existing stores
    const stores = await prisma.store.findMany({
      where: {
        organizationId
      }
    });
    
    console.log('Existing stores:', stores);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });