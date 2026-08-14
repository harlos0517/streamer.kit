import { prisma } from '../src/index.ts'

async function main() {
  await prisma.currency.upsert({
    where: { key: 'coin' },
    update: {},
    create: { key: 'coin', name: 'Coin' },
  })
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async() => {
    await prisma.$disconnect()
  })
