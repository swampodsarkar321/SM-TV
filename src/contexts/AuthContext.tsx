import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth, isDemo } from '../firebase/config'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from 'firebase/auth'

type AuthCtx = {
  user: User | null
  loading: boolean
  login: (email:string, pass:string)=>Promise<void>
  register: (email:string, pass:string)=>Promise<void>
  logout: ()=>Promise<void>
  isGuest: boolean
}

const Ctx = createContext<AuthCtx>(null as any)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (isDemo) {
      const saved = localStorage.getItem('demo_user')
      if (saved) try{ setUser(JSON.parse(saved)) }catch{}
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false) })
    return ()=>unsub()
  },[])

  const login = async (email:string, pass:string)=>{
    if (isDemo) {
      const fake = { uid:'demo_'+email, email, displayName: email.split('@')[0] } as unknown as User
      localStorage.setItem('demo_user', JSON.stringify(fake))
      setUser(fake)
      return
    }
    await signInWithEmailAndPassword(auth, email, pass)
  }
  const register = async (email:string, pass:string)=>{
    if (isDemo) {
      const fake = { uid:'demo_'+email, email, displayName: email.split('@')[0] } as unknown as User
      localStorage.setItem('demo_user', JSON.stringify(fake))
      setUser(fake)
      return
    }
    await createUserWithEmailAndPassword(auth, email, pass)
  }
  const logout = async ()=>{
    if (isDemo) { localStorage.removeItem('demo_user'); setUser(null); return }
    await signOut(auth)
  }

  const isGuest = !user
  return <Ctx.Provider value={{ user, loading, login, register, logout, isGuest }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
