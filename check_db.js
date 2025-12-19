const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database content...');
  console.log('URL:', process.env.DATABASE_URL);
  
  try {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
