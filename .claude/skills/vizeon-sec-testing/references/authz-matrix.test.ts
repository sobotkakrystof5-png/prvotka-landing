// tests/security/authz-matrix.test.ts
// Generované testy autorizační matice proti lokální Supabase (supabase start).
// Matice = kopie docs/security/access-matrix.md. Změna matice → automaticky nové testy.
// Testuje se PŘÍMO přes Supabase klienta s JWT dané role (obchází UI i Server Actions = nejpřísnější test RLS),
// a volitelně i přes Server Actions (viz druhý blok).

import { describe, it, expect, beforeAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { seedTenants, type Fixture } from './fixtures'   // vytvoří 2 firmy × role přes admin klienta, vrátí přihlášené klienty

type Role = 'anon' | 'viewer' | 'user' | 'manager' | 'owner' | 'foreignOwner'
type Op = 'select' | 'insert' | 'update' | 'delete'

// true = musí projít, false = musí být zakázáno
const matrix: Record<string, Record<Op, Record<Role, boolean>>> = {
  invoices: {
    select: { anon: false, viewer: true,  user: true,  manager: true,  owner: true,  foreignOwner: false },
    insert: { anon: false, viewer: false, user: true,  manager: true,  owner: true,  foreignOwner: false },
    update: { anon: false, viewer: false, user: true,  manager: true,  owner: true,  foreignOwner: false },
    delete: { anon: false, viewer: false, user: false, manager: true,  owner: true,  foreignOwner: false },
  },
  contacts: {
    select: { anon: false, viewer: true,  user: true,  manager: true,  owner: true,  foreignOwner: false },
    insert: { anon: false, viewer: false, user: true,  manager: true,  owner: true,  foreignOwner: false },
    update: { anon: false, viewer: false, user: true,  manager: true,  owner: true,  foreignOwner: false },
    delete: { anon: false, viewer: false, user: false, manager: true,  owner: true,  foreignOwner: false },
  },
}

let fx: Fixture
beforeAll(async () => { fx = await seedTenants() })

// Pokus o operaci nad záznamem FIRMY A; vrací true, pokud měla efekt.
async function attempt(db: SupabaseClient, table: string, op: Op): Promise<boolean> {
  const target = fx.records[table]                // existující řádek firmy A
  switch (op) {
    case 'select': {
      const { data } = await db.from(table).select('id').eq('id', target.id)
      return (data?.length ?? 0) > 0
    }
    case 'insert': {
      const { error } = await db.from(table).insert(fx.newRow(table, fx.orgA)).select('id').single()
      return !error
    }
    case 'update': {
      const { data } = await db.from(table).update(fx.harmlessUpdate(table)).eq('id', target.id).select('id')
      return (data?.length ?? 0) > 0
    }
    case 'delete': {
      const row = await fx.createDisposable(table, fx.orgA)   // aby delete nemazal sdílený řádek
      const { data } = await db.from(table).delete().eq('id', row.id).select('id')
      return (data?.length ?? 0) > 0
    }
  }
}

for (const [table, ops] of Object.entries(matrix)) {
  describe(`RLS matice: ${table}`, () => {
    for (const [op, roles] of Object.entries(ops) as [Op, Record<Role, boolean>][]) {
      for (const [role, allowed] of Object.entries(roles) as [Role, boolean][]) {
        it(`${role} ${allowed ? 'SMÍ' : 'NESMÍ'} ${op}`, async () => {
          const db = fx.clients[role]
          expect(await attempt(db, table, op)).toBe(allowed)
        })
      }
    }
  })
}

// --- Mass assignment / citlivá pole ---
describe('citlivá pole', () => {
  it('owner nemůže přesunout fakturu do cizí firmy', async () => {
    const { error } = await fx.clients.owner.from('invoices')
      .update({ org_id: fx.orgB }).eq('id', fx.records.invoices.id)
    expect(error).not.toBeNull()
  })
  it('klient nenastaví status=paid', async () => {
    const { error } = await fx.clients.owner.from('invoices')
      .update({ status: 'paid' }).eq('id', fx.records.invoices.id)
    expect(error).not.toBeNull()
  })
  it('uživatel si nezmění roli přes memberships', async () => {
    const { data } = await fx.clients.user.from('memberships')
      .update({ role: 'owner' }).eq('user_id', fx.users.user.id).select()
    expect(data ?? []).toHaveLength(0)
  })
  it('uživatel si nedá roli přes user_metadata', async () => {
    await fx.clients.user.auth.updateUser({ data: { role: 'owner', is_admin: true } })
    const { data } = await fx.clients.user.from('invoices').delete().eq('id', fx.records.invoices.id).select()
    expect(data ?? []).toHaveLength(0)
  })
})

// --- Tokeny ---
describe('tokeny', () => {
  it('zfalšovaný JWT je odmítnut', async () => {
    const forged = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${fx.forgedJwt}` } },
    })
    const { data, error } = await forged.from('invoices').select('id')
    expect(error ?? (data?.length === 0)).toBeTruthy()
  })
})

// --- Server Actions (doplň podle projektu) ---
// import { voidInvoice } from '@/app/(app)/invoices/actions'
// it('cizí firma nemůže stornovat fakturu přes Server Action', async () => {
//   await asUser(fx.users.foreignOwner)            // mock cookies() / session helper projektu
//   const res = await voidInvoice({ orgId: fx.orgA, invoiceId: fx.records.invoices.id, reason: 'x' })
//   expect(res.ok).toBe(false)
// })
