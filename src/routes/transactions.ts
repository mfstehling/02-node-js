import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const transactionCreateSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = transactionCreateSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      section_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const response = await knex('transactions').select('*')
    return { response }
  })

  app.get('/:id', async (request) => {
    const transactionGetSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = transactionGetSchema.parse(request.params)
    const response = await knex('transactions').where('id', id).first()
    return { response }
  })

  app.get('/resume', async () => {
    const response = await knex('transactions')
      .sum('amount', { as: 'resume' })
      .first()
    return { response }
  })
}
