// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      section_id?: string
    }
  }
}
