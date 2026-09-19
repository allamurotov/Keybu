import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: { phone: true, role: true, fullName: true }
  });
  console.log('Mentors:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
