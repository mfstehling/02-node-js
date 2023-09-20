import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const response = await knex('transactions').select('*')
  return response
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server running on port 3334')
  })
