// This is a simple script to test the Prisma client
import { PrismaClient } from '@prisma/client';

// Create a new instance of PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Test connection with a simple query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    const projectCount = await prisma.project.count();
    console.log('Project count:', projectCount);
    
    const organizationCount = await prisma.organization.count();
    console.log('Organization count:', organizationCount);
    
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 