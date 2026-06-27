import { useState, useEffect } from "react"
import { lookupDevice, logCheck, getChecks } from "../api"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../App"
import { supabase } from "../supabaseClient"


export default function RepairPortal() {
  const [tab, setTab] = useState("dashboard")
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState("")
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setBusinessName(data.user?.user_metadata?.business_name || "Repair Shop")
    })
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const data = await getChecks()
      setChecks(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const bg = dark ? "#070B14" : "#F8FAFC"
  const sidebarBg = dark ? "#0B1120" : "white"
  const border = dark ? "rgba(255,255,255,0.08)" : "#E2E8F0"
  const text = dark ? "#E2E8F0" : "#1E293B"
  const subtext = dark ? "#94A3B8" : "#64748B"

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)", background: bg }}>
      <aside style={{ width: 210, background: sidebarBg, borderRight: `1px solid ${border}`, padding: "16px 0", flexShrink: 0 }}>
        {[
          { id: "dashboard", icon: "🏠", label: "Dashboard" },
          { id: "history", icon: "📋", label: "Check History" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 16px", border: "none",
            background: tab === item.id ? (dark ? "rgba(217,119,6,0.12)" : "#FFFBEB") : "none",
            color: tab === item.id ? "#D97706" : subtext,
            fontWeight: 500, fontSize: 14, cursor: "pointer", textAlign: "left"
          }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{ borderTop: `1px solid ${border}`, marginTop: 12, paddingTop: 12 }}>
          <button onClick={() => navigate("/")} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 16px", border: "none",
            background: "none", color: subtext, fontSize: 14, cursor: "pointer"
          }}>← Back to portals</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", color: text }}>
        {tab === "dashboard" && <RepairDashboard checks={checks} loading={loading} onUpdate={refresh} text={text} subtext={subtext} businessName={businessName} />}
        {tab === "history" && <RepairHistory checks={checks} loading={loading} text={text} subtext={subtext} border={border} dark={dark} />}
      </main>
    </div>
  )
}

function RepairDashboard({ checks, loading, onUpdate, text, subtext, businessName }) {
  const [imei, setImei] = useState("")
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)
  const [searched, setSearched] = useState(false)

  const stolenCount = checks.filter(c => c.result !== "clean").length
  const cleanCount = checks.filter(c => c.result === "clean").length

  async function handleCheck() {
    if (!imei) return
    setChecking(true); setResult(null); setSearched(false)
    try {
      const data = await lookupDevice(imei.trim())
      setResult(data)
      setSearched(true)
      await logCheck({ imei: imei.trim(), result: data.status })
      onUpdate()
    } catch(e) {
      setSearched(true)
      await logCheck({ imei: imei.trim(), result: "not_found" })
      onUpdate()
    }
    finally { setChecking(false) }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: text }}>Repair Shop Dashboard</h1>
      <p style={{ color: subtext, marginBottom: 20 }}>{businessName}</p>

      {loading ? <div style={{ color: subtext }}>Loading...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Total Checks", value: checks.length, color: "#38BDF8" },
            { label: "Stolen Detected", value: stolenCount, color: "#DC2626" },
            { label: "Clean Devices", value: cleanCount, color: "#16A34A" },
          ].map(s => (
            <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: subtext, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: text }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: text }}>Check a device before servicing</div>
        <div style={{ color: subtext, fontSize: 13, marginBottom: 14 }}>Enter the IMEI before accepting any device for repair.</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input className="input" placeholder="Scan or type IMEI..."
            value={imei} onChange={e => setImei(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            style={{ fontFamily: "monospace", letterSpacing: 1 }} />
          <button className="btn btn-primary" onClick={handleCheck} disabled={checking} style={{ whiteSpace: "nowrap" }}>
            {checking ? "Checking..." : "✅ Check"}
          </button>
        </div>
        {searched && !result && <div className="alert alert-danger" style={{ marginBottom: 0 }}>IMEI not found in registry — proceed with caution.</div>}
        {result && (
          <div className={`alert ${result.status === "clean" ? "alert-success" : "alert-danger"}`} style={{ marginBottom: 0 }}>
            {result.status === "clean"
              ? <>✅ <strong>Device is clean — safe to service.</strong> This check has been logged.</>
              : <>🚨 <strong>Device reported {result.status} — do not service.</strong> This check has been logged.</>
            }
          </div>
        )}
      </div>
    </div>
  )
}

function RepairHistory({ checks, loading, text, subtext, border, dark }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>Check History</h1>
      {loading ? <div style={{ color: subtext }}>Loading...</div> : checks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>No checks performed yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                {["Date & Time", "IMEI", "Result"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                    color: subtext, textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checks.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < checks.length - 1 ? `1px solid ${border}` : "none" }}>
                  <td style={{ padding: "12px 16px", color: subtext }}>{new Date(c.checked_at).toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: subtext }}>{c.imei}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: c.result === "clean" ? "#F0FDF4" : "#FEF2F2",
                      color: c.result === "clean" ? "#16A34A" : "#DC2626"
                    }}>{c.result === "clean" ? "✅ Clean" : "🚨 " + c.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}