import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setErr(''); setBusy(true); try{ await login(email,pass); nav('/') }catch(e:any){ setErr(e?.message||'Login failed') } finally{ setBusy(false)} }
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-[420px] bg-[#14141f] border border-white/10 rounded-[24px] p-6 md:p-8">
        <h1 className="text-xl font-black">Sign In</h1>
        <p className="text-sm text-zinc-400 mt-1">Same Firebase account — Android & Web sync</p>
        <div className="mt-6 space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full bg-[#0f0f16] border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:border-white/20" />
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" required className="w-full bg-[#0f0f16] border border-white/10 rounded-xl h-11 px-4 text-sm focus:outline-none focus:border-white/20" />
          {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{err}</div>}
          <button disabled={busy} className="w-full bg-white text-black rounded-full h-11 font-bold text-sm disabled:opacity-60">{busy?'Signing in...':'SIGN IN'}</button>
          <button type="button" onClick={()=>nav('/')} className="w-full bg-white/5 border border-white/10 rounded-full h-11 font-semibold text-sm">Continue as Guest</button>
        </div>
        <div className="text-center text-sm text-zinc-400 mt-6">Don't have an account? <Link to="/register" className="text-white underline">Create Account</Link></div>
      </form>
    </div>
  )
}
