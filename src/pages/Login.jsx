import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../supabaseClient"
import Logo from "../Logo"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
  if (!email || !password) { setError("Please fill in both fields."); return }
  setLoading(true); setError("")
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  setLoading(false)
  if (error) { setError(error.message); return }

  const role = data.user?.user_metadata?.role || "owner"
  const destinations = {
    owner: "/owner",
    officer: "/law",
    repair_shop: "/repair",
    reseller: "/reseller",
    admin: "/admin",
  }
  navigate(destinations[role] || "/owner")
}

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
  <Logo size={36} />
  <span style={{ fontSize: 24, fontWeight: 700 }}>TraceBack</span>
</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: " inherit" }}>Welcome back</h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Log in to your TraceBack account</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card">
        <div className="form-group">
          <label>Email</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", marginTop: 16 }}>
        Don't have an account? <Link to="/signup" style={{ color: "#1A56A8", fontWeight: 600 }}>Sign up</Link>
      </p>
    </div>
  )
}