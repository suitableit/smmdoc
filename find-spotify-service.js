const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSpotifyService() {
  try {
    console.log('=== Finding Spotify Service ===');
    
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { rate: { gte: 8.5, lte: 8.6 } },
          { name: { contains: 'Spotify', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        rate: true,
        rateUSD: true
      }
    });
    
    console.log('Found services:');
    services.forEach(service => {
      console.log(`ID: ${service.id}`);
      console.log(`Name: ${service.name}`);
      console.log(`Rate: ${service.rate} USD`);
      console.log(`Rate USD: ${service.rateUSD}`);
      console.log(`Converted to BDT: ৳${(service.rate * 120).toFixed(2)}`);
      console.log('---');
    });
    
    if (services.length === 0) {
      console.log('No services found with rate 8.55 or containing "Spotify"');
      
      // Show all services with rates between 8-9
      const nearServices = await prisma.service.findMany({
        where: {
          rate: { gte: 8, lte: 9 }
        },
        select: {
          id: true,
          name: true,
          rate: true
        },
        take: 10
      });
      
      console.log('\nServices with rates between 8-9 USD:');
      nearServices.forEach(service => {
        console.log(`${service.name}: $${service.rate}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findSpotifyService();
