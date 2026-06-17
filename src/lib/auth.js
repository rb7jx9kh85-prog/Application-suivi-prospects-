import { S, uid } from './storage'

export const Auth = {
  me: () => S.get('pp_me'),
  loggedIn: () => !!Auth.me(),
  register(name, email, pw) {
    const users = S.get('pp_users', [])
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { err: 'Email déjà utilisé.' }
    const u = { id: uid(), name, email, pw, at: Date.now() }
    users.push(u)
    S.set('pp_users', users)
    S.set('pp_me', { id: u.id, name, email })
    return { ok: true }
  },
  login(email, pw) {
    const u = S.get('pp_users', []).find(u => u.email.toLowerCase() === email.toLowerCase() && u.pw === pw)
    if (!u) return { err: 'Email ou mot de passe incorrect.' }
    S.set('pp_me', { id: u.id, name: u.name, email: u.email })
    return { ok: true }
  },
  logout() { S.del('pp_me') },
}
