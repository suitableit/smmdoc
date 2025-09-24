const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProvider() {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: 19 },
      select: {
        id: true,
        name: true,
        api_url: true,
        balance_endpoint: true,
        balance_action: true,
        http_method: true,
        status: true
      }
    });
    console.log('ATTPanel Provider Config:', JSON.stringify(provider, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProvider();