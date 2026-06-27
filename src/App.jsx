import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState, createContext, useContext } from "react"
import Home from "./pages/Home"
import Lookup from "./pages/Lookup"
import Register from "./pages/Register"
import Report from "./pages/Report"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import OwnerPortal from "./pages/OwnerPortal"
import LawPortal from "./pages/LawPortal"
import RepairPortal from "./pages/RepairPortal"
import AdminPortal from "./pages/AdminPortal"
import ProtectedRoute from "./ProtectedRoute"
import { supabase } from "./supabaseClient"
import "./App.css"
import Logo from "./Logo"
import BusinessSignup from "./pages/BusinessSignup"


export const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} })
export function useTheme() { return useContext(ThemeContext) }

function Navbar({ theme, toggleTheme }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate("/")
  }

  const isPortal = ["/owner", "/law", "/repair", "/admin"].some(p => location.pathname.startsWith(p))
  const isHome = location.pathname === "/"
  const dark = isHome ? theme === "dark" : true

  const ThemeButton = () => (
    <button onClick={toggleTheme} title="Toggle theme" style={{
      background: "rgba(255,255,255,0.1)", border: "none", color: "white",
      width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 15,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>{theme === "dark" ? "☀️" : "🌙"}</button>
  )

  if (isPortal) return (
    <nav style={{ background: "#0F2D5E", padding: "0 24px", height: "56px",
      display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <Link to="/" style={{ color: "white", fontWeight: 700, fontSize: 18, textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
  <Logo size={28} /> TraceBack
</Link>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <ThemeButton />
        {session && (
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.1)", color: "white", border: "none",
            padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer"
          }}>Log out</button>
        )}
      </div>
    </nav>
  )
  

  return (
    <nav style={{
      background: dark ? "#070B14" : "#0F2D5E",
      padding: "0 32px", height: "56px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: isHome ? "1px solid rgba(255,255,255,0.08)" : "none"
    }}>
      <Link to="/" style={{ color: "white", fontWeight: 700, fontSize: 18, textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
  <Logo size={28} /> TraceBack
</Link>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[["/lookup", "🔍 Lookup"], ["/register", "📱 Register"], ["/report", "🚨 Report"]].map(([path, label]) => (
          <Link key={path} to={path} style={{
            color: location.pathname === path ? "white" : "rgba(255,255,255,0.7)",
            textDecoration: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "500",
            background: location.pathname === path ? "rgba(255,255,255,0.15)" : "none"
          }}>{label}</Link>
        ))}
           <ThemeButton />
        {session ? (
          <button onClick={handleLogout} style={{
            background: "rgba(255,255,255,0.1)", color: "white", border: "none",
            padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", marginLeft: 8
          }}>Log out</button>
        ) : (
          <Link to="/login" style={{
            background: "white", color: "#0F2D5E", textDecoration: "none",
            padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 700, marginLeft: 8
          }}>Log in</Link>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  const [theme, setTheme] = useState("dark")
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

  useEffect(() => {
    document.body.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/lookup" element={<Lookup />} />
  <Route path="/register" element={<Register />} />
  <Route path="/report" element={<Report />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/business-signup" element={<BusinessSignup />} />
  <Route path="/owner/*" element={<ProtectedRoute><OwnerPortal /></ProtectedRoute>} />
  <Route path="/law/*" element={<ProtectedRoute allowedRoles={["officer"]}><LawPortal /></ProtectedRoute>} />
  <Route path="/repair/*" element={<ProtectedRoute allowedRoles={["repair_shop"]}><RepairPortal /></ProtectedRoute>} />
  <Route path="/reseller/*" element={<ProtectedRoute allowedRoles={["reseller"]}><RepairPortal /></ProtectedRoute>} />
 <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPortal /></ProtectedRoute>} />
</Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}