const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.workoutAssignment.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.user.deleteMany();

  // Create trainers
  const trainer1 = await prisma.user.create({
    data: {
      email: 'trainer1@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'TRAINER'
    }
  });

  const trainer2 = await prisma.user.create({
    data: {
      email: 'trainer2@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'TRAINER'
    }
  });

  console.log('✅ Created 2 trainers');

  // Create clients
  const client1 = await prisma.user.create({
    data: {
      email: 'client1@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CLIENT'
    }
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CLIENT'
    }
  });

  const client3 = await prisma.user.create({
    data: {
      email: 'client3@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'CLIENT'
    }
  });

  console.log('✅ Created 3 clients');

  // Create workouts
  const workout1 = await prisma.workout.create({
    data: {
      name: 'Full Body Strength Training',
      description: 'Complete body workout focusing on compound movements and strength building',
      trainerId: trainer1.id
    }
  });

  const workout2 = await prisma.workout.create({
    data: {
      name: 'Cardio HIIT Session',
      description: 'High-intensity interval training for cardiovascular endurance',
      trainerId: trainer1.id
    }
  });

  const workout3 = await prisma.workout.create({
    data: {
      name: 'Core and Flexibility',
      description: 'Focus on core strength and flexibility exercises',
      trainerId: trainer1.id
    }
  });

  const workout4 = await prisma.workout.create({
    data: {
      name: 'Upper Body Push/Pull',
      description: 'Balanced upper body workout alternating between push and pull exercises',
      trainerId: trainer2.id
    }
  });

  const workout5 = await prisma.workout.create({
    data: {
      name: 'Lower Body Power',
      description: 'Leg day workout emphasizing power and explosiveness',
      trainerId: trainer2.id
    }
  });

  console.log('✅ Created 5 workouts');

  // Create workout assignments
  await prisma.workoutAssignment.create({
    data: {
      workoutId: workout1.id,
      clientId: client1.id,
      status: 'IN_PROGRESS'
    }
  });

  await prisma.workoutAssignment.create({
    data: {
      workoutId: workout2.id,
      clientId: client1.id,
      status: 'PENDING'
    }
  });

  await prisma.workoutAssignment.create({
    data: {
      workoutId: workout3.id,
      clientId: client2.id,
      status: 'COMPLETED'
    }
  });

  await prisma.workoutAssignment.create({
    data: {
      workoutId: workout4.id,
      clientId: client2.id,
      status: 'IN_PROGRESS'
    }
  });

  await prisma.workoutAssignment.create({
    data: {
      workoutId: workout5.id,
      clientId: client3.id,
      status: 'PENDING'
    }
  });
  console.log('\n👥 Client IDs:');
console.log(`Client 1: ${client1.id}`);
console.log(`Client 2: ${client2.id}`);
console.log(`Client 3: ${client3.id}`);
  console.log('✅ Created 5 workout assignments');
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('Trainers: trainer1@example.com, trainer2@example.com');
  console.log('Clients: client1@example.com, client2@example.com, client3@example.com');
  console.log('Password for all users: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
