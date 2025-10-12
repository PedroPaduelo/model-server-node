import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de usuários...');

  // Limpar dados existentes
  await prisma.token.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários de teste
  const users = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'Administrador',
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      isActive: true,
    },
    {
      email: 'user@example.com',
      password: 'user123',
      fullName: 'Usuário Comum',
      firstName: 'Common',
      lastName: 'User',
      dateOfBirth: new Date('1995-05-15'),
      isActive: true,
    },
    {
      email: 'test@example.com',
      password: 'test123',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('2000-12-10'),
      isActive: true,
    }
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 8);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    console.log(`Usuário criado: ${user.email}`);
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });