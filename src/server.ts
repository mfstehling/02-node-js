import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async () => {
  const response = await knex('sqlite_schema').select('*')
  return response
})

app
  .listen({
    port: 3334,
  })
  .then(() => {
    console.log('Server running on port 3334')
  })
