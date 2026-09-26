import { PrismaClient } from '@prisma/client'
import data from './data.json' assert { type: 'json' }

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  for (const job of data) {
    try {
      await prisma.jobOffer.upsert({
        where: { externalId: job.id },
        update: {},
        create: {
          estado: job.estado,
          prioridad: job.prioridad,
          acepta_argentina: job.acepta_argentina,
          empresa: job.empresa,
          titulo: job.titulo,
          salario: String(job.salario || ''),
          ubicaciones: job.ubicaciones,
          fecha_publicacion: job.fecha_publicacion,
          url_aplicar: job.url_aplicar,
          linkedin_empresa: job.linkedin_empresa,
          linkedin_people_ar: job.linkedin_people_ar,
          empleados: job.empleados ? parseInt(job.empleados) : null,
          gente_ar: job.gente_ar ? parseInt(job.gente_ar) : null,
          motivo: job.motivo,
          fecha_detectada: job.fecha_detectada,
          externalId: job.id,
          slug: job.slug,
          experiencia: job.experiencia,
          visa: job.visa,
          etapa: job.etapa,
        },
      })
      console.log(`Created job with id: ${job.id}`)
    } catch (e) {
      console.error(`Error creating job ${job.id}:`, e)
    }
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
