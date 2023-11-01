import { beforeAll, it, afterAll, describe, expect, beforeEach } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 3000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list transactions', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 3000,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    const transactionList = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(transactionList.body.response).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 3000,
      }),
    ])
  })

  it('should be able to list specific transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 3000,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    const transactionList = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const specificTransaction = await request(app.server)
      .get(`/transactions/${transactionList.body.response[0].id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(specificTransaction.body.response).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 3000,
      }),
    )
  })

  it('should be able to list summary', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 3000,
        type: 'debit',
      })
      .set('Cookie', cookies)

    const summary = await request(app.server)
      .get('/transactions/resume')
      .set('Cookie', cookies)
      .expect(200)

    expect(summary.body.response).toEqual(
      expect.objectContaining({
        resume: 2000,
      }),
    )
  })
})
