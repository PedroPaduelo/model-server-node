import { PrismaClient, STATUS, TokenType, AccountProvider } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes (ordem importante devido às relações)
  await prisma.member.deleteMany();
  await prisma.role.deleteMany();
  await prisma.customDomain.deleteMany();
  await prisma.company.deleteMany();
  await prisma.token.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Dados existentes removidos');

  // Criar usuários
  const passwordHash = await hash('123456789', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: passwordHash,
        fullName: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        dateOfBirth: new Date('1990-01-01'),
        avatarUrl: 'https://github.com/admin.png'
      }
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: passwordHash,
        fullName: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        dateOfBirth: new Date('1985-05-15'),
        avatarUrl: 'https://github.com/johndoe.png'
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: passwordHash,
        fullName: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
        dateOfBirth: new Date('1992-08-20'),
        avatarUrl: 'https://github.com/janesmith.png'
      }
    }),
    prisma.user.create({
      data: {
        email: 'developer@techcorp.com',
        password: passwordHash,
        fullName: 'Developer User',
        firstName: 'Developer',
        lastName: 'User',
        isActive: true,
        dateOfBirth: new Date('1988-03-10'),
      }
    }),
    prisma.user.create({
      data: {
        email: 'manager@startup.com',
        password: passwordHash,
        fullName: 'Manager User',
        firstName: 'Manager',
        lastName: 'User',
        isActive: true,
        dateOfBirth: new Date('1980-12-25'),
      }
    })
  ]);

  console.log('👤 Usuários criados');

  // Criar empresas
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        slug: 'techcorp-solutions',
        domainsLimit: 3,
        domainsUsage: 1,
        userLimit: 50,
        userUsage: 3,
        status: STATUS.ACTIVE,
        ownerId: users[0].id,
        shouldAttachUsersByDomain: true
      }
    }),
    prisma.company.create({
      data: {
        name: 'Startup Innovations',
        slug: 'startup-innovations',
        domainsLimit: 2,
        domainsUsage: 0,
        userLimit: 20,
        userUsage: 2,
        status: STATUS.ACTIVE,
        ownerId: users[1].id,
        shouldAttachUsersByDomain: false
      }
    }),
    prisma.company.create({
      data: {
        name: 'Creative Agency',
        slug: 'creative-agency',
        domainsLimit: 1,
        domainsUsage: 0,
        userLimit: 15,
        userUsage: 1,
        status: STATUS.INACTIVE,
        ownerId: users[2].id,
        shouldAttachUsersByDomain: false
      }
    })
  ]);

  console.log('🏢 Empresas criadas');

  // Criar domínios customizados
  const customDomains = await Promise.all([
    prisma.customDomain.create({
      data: {
        domain: 'techcorp.com',
        primary: true,
        verified: true,
        onlyEmail: false,
        companyId: companies[0].id,
      }
    }),
    prisma.customDomain.create({
      data: {
        domain: 'dev.techcorp.com',
        primary: false,
        verified: true,
        onlyEmail: true,
        companyId: companies[0].id,
      }
    }),
    prisma.customDomain.create({
      data: {
        domain: 'startup.com',
        primary: true,
        verified: false,
        onlyEmail: false,
        companyId: companies[1].id,
      }
    })
  ]);

  console.log('🌐 Domínios customizados criados');

  // Criar roles
  const roles = await Promise.all([
    // Roles da TechCorp
    prisma.role.create({
      data: {
        name: 'Admin',
        status: STATUS.ACTIVE,
        permissions: ['*'],
        companyId: companies[0].id,
        createdById: users[0].id,
        updatedById: users[0].id
      }
    }),
    prisma.role.create({
      data: {
        name: 'Developer',
        status: STATUS.ACTIVE,
        permissions: ['read:projects', 'write:code', 'deploy:staging'],
        companyId: companies[0].id,
        createdById: users[0].id,
        updatedById: users[0].id
      }
    }),
    prisma.role.create({
      data: {
        name: 'QA Tester',
        status: STATUS.ACTIVE,
        permissions: ['read:projects', 'write:tests', 'read:reports'],
        companyId: companies[0].id,
        createdById: users[0].id,
        updatedById: users[0].id
      }
    }),
    // Roles da Startup
    prisma.role.create({
      data: {
        name: 'Founder',
        status: STATUS.ACTIVE,
        permissions: ['*'],
        companyId: companies[1].id,
        createdById: users[1].id,
        updatedById: users[1].id
      }
    }),
    prisma.role.create({
      data: {
        name: 'Employee',
        status: STATUS.ACTIVE,
        permissions: ['read:basic', 'write:basic'],
        companyId: companies[1].id,
        createdById: users[1].id,
        updatedById: users[1].id
      }
    }),
    // Role da Creative Agency
    prisma.role.create({
      data: {
        name: 'Creative Director',
        status: STATUS.ACTIVE,
        permissions: ['*'],
        companyId: companies[2].id,
        createdById: users[2].id,
        updatedById: users[2].id
      }
    })
  ]);

  console.log('👔 Roles criados');

  // Criar memberships
  const members = await Promise.all([
    // TechCorp members
    prisma.member.create({
      data: {
        userId: users[0].id,
        companyId: companies[0].id,
        roleId: roles[0].id // Admin
      }
    }),
    prisma.member.create({
      data: {
        userId: users[3].id, // developer@techcorp.com
        companyId: companies[0].id,
        roleId: roles[1].id // Developer
      }
    }),
    // Startup members
    prisma.member.create({
      data: {
        userId: users[1].id,
        companyId: companies[1].id,
        roleId: roles[3].id // Founder
      }
    }),
    prisma.member.create({
      data: {
        userId: users[4].id, // manager@startup.com
        companyId: companies[1].id,
        roleId: roles[4].id // Employee
      }
    }),
    // Creative Agency member
    prisma.member.create({
      data: {
        userId: users[2].id,
        companyId: companies[2].id,
        roleId: roles[5].id // Creative Director
      }
    })
  ]);

  console.log('🤝 Memberships criados');

  // Atualizar default role para auto-join
  await prisma.company.update({
    where: { id: companies[0].id },
    data: { defaultRoleIdInAutoJoin: roles[1].id } // Developer role
  });

  await prisma.company.update({
    where: { id: companies[1].id },
    data: { defaultRoleIdInAutoJoin: roles[4].id } // Employee role
  });

  console.log('🔧 Default roles para auto-join configurados');

  // Criar algumas contas OAuth de exemplo
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        provider: AccountProvider.GOOGLE,
        providerAccountId: 'google_123456789',
        userId: users[0].id
      }
    }),
    prisma.account.create({
      data: {
        provider: AccountProvider.GOOGLE,
        providerAccountId: 'google_987654321',
        userId: users[1].id
      }
    })
  ]);

  console.log('🔐 Contas OAuth criadas');

  // Criar alguns tokens de recuperação de senha (expirados para segurança)
  const tokens = await Promise.all([
    prisma.token.create({
      data: {
        type: TokenType.PASSWORD_RECOVER,
        userId: users[2].id,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expirado há 1 dia
      }
    })
  ]);

  console.log('🎟️ Tokens de exemplo criados');

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`👤 ${users.length} usuários`);
  console.log(`🏢 ${companies.length} empresas`);
  console.log(`🌐 ${customDomains.length} domínios customizados`);
  console.log(`👔 ${roles.length} roles`);
  console.log(`🤝 ${members.length} memberships`);
  console.log(`🔐 ${accounts.length} contas OAuth`);
  console.log(`🎟️ ${tokens.length} tokens`);

  console.log('\n🔑 Credenciais de login:');
  console.log('Email: admin@example.com | Senha: 123456789');
  console.log('Email: john.doe@example.com | Senha: 123456789');
  console.log('Email: jane.smith@example.com | Senha: 123456789');
  console.log('Email: developer@techcorp.com | Senha: 123456789');
  console.log('Email: manager@startup.com | Senha: 123456789');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 