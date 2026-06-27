import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "../supabaseClient"
import Logo from "../Logo"


export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignup() {
    if (!name || !email || !password) { setError("Please fill in all fields."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true); setError(""); setSuccess("")

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })

    setLoading(false)
    if (error) { setError(error.message); return }

    if (data.session) {
      navigate("/owner")
    } else {
      setSuccess("Account created! Check your email to confirm, then log in.")
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
 <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
  <Logo size={36} />
  <span style={{ fontSize: 24, fontWeight: 700 }}>TraceBack</span>
</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "inherit" }}>Create your account</h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>Join TraceBack to protect your devices</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="form-group">
          <label>Full name</label>
          <input className="input" placeholder="Sarah Mwangi"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input className="input" type="password" placeholder="At least 6 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSignup()} />
        </div>
        <button className="btn btn-primary" onClick={handleSignup} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", marginTop: 16 }}>
        Already have an account? <Link to="/login" style={{ color: "#1A56A8", fontWeight: 600 }}>Log in</Link>
      </p>
    </div>
  )
}