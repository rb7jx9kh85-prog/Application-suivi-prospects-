import { S, uid } from './storage'
import { Auth } from './auth'

export function mk(t) {
  const key = () => `pp_${Auth.me()?.id}_${t}`
  return {
    all: () => S.get(key(), []),
    add: (o) => { const d = mk(t).all(); d.unshift({ ...o, id: uid(), at: Date.now() }); S.set(key(), d) },
    upd: (id, o) => S.set(key(), mk(t).all().map(x => x.id === id ? { ...x, ...o } : x)),
    del: (id) => S.set(key(), mk(t).all().filter(x => x.id !== id)),
  }
}

export const Calls = mk('calls')
export const Appts = mk('appts')
export const Pros = mk('pros')
