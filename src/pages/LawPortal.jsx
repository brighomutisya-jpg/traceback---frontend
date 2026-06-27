import { useState, useEffect } from "react"
import { lookupDevice, getAllIncidents, getAllDevices } from "../api"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../App"

export default function LawPortal() {
  const [tab, setTab] = useState("dashboard")
  const [incidents, setIncidents] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"

  async function refresh() {
    setLoading(true)
    try {
      const [inc, dev] = await Promise.all([getAllIncidents(), getAllDevices()])
      setIncidents(inc)
      setDevices(dev)
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
          { id: "lookup", icon: "🔎", label: "IMEI Lookup" },
          { id: "cases", icon: "📋", label: "Cases" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 16px", border: "none",
            background: tab === item.id ? (dark ? "rgba(34,197,94,0.1)" : "#F0FDF4") : "none",
            color: tab === item.id ? "#16A34A" : subtext,
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
        {tab === "dashboard" && <LawDashboard incidents={incidents} devices={devices} loading={loading} setTab={setTab} text={text} subtext={subtext} dark={dark} />}
        {tab === "lookup" && <LawLookup text={text} />}
        {tab === "cases" && <LawCases incidents={incidents} devices={devices} loading={loading} text={text} subtext={subtext} border={border} dark={dark} />}
      </main>
    </div>
  )
}

function LawDashboard({ incidents, devices, loading, setTab, text, subtext, dark }) {
  const open = devices.filter(d => d.status === "stolen" || d.status === "lost").length
  const recovered = devices.filter(d => d.status === "recovered").length

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: text }}>Officer Dashboard</h1>
      <p style={{ color: subtext, marginBottom: 24 }}>Inspector J. Kariuki · Nairobi County Police · Badge #KNP-4421</p>

      {loading ? <div style={{ color: subtext }}>Loading cases...</div> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Open Cases", value: open, color: "#38BDF8" },
              { label: "Recovered", value: recovered, color: "#16A34A" },
              { label: "Total Incidents", value: incidents.length, color: "#D97706" },
            ].map(s => (
              <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, marginBottom: 0 }}>
                <div style={{ fontSize: 11, color: subtext, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: text }}>{s.value}</div>
              </div>
            ))}
          </div>

          {open > 0 && (
            <div className="alert" style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A", marginBottom: 20 }}>
              ⚠️ <strong>{open} open case{open > 1 ? "s" : ""}</strong> requiring attention.
              <span onClick={() => setTab("cases")} style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }}>View cases →</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: text }}>Quick IMEI lookup</div>
            <button className="btn btn-primary" onClick={() => setTab("lookup")} style={{ width: "100%" }}>🔎 Go to IMEI Lookup</button>
          </div>
        </>
      )}
    </div>
  )
}

function LawLookup({ text }) {
  const [imei, setImei] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleLookup() {
    if (!imei) return
    setLoading(true); setResult(null); setSearched(false)
    try {
      const data = await lookupDevice(imei.trim())
      setResult(data); setSearched(true)
    } catch(e) { setSearched(true) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: text }}>IMEI Lookup</h1>
      <p style={{ color: text, opacity: 0.7, marginBottom: 20 }}>Full device and ownership details. All lookups are logged.</p>
      <div className="card">
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" placeholder="Enter 15-digit IMEI"
            value={imei} onChange={e => setImei(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
            style={{ fontFamily: "monospace", letterSpacing: 1 }} />
          <button className="btn btn-primary" onClick={handleLookup} disabled={loading} style={{ whiteSpace: "nowrap" }}>
            {loading ? "Searching..." : "🔎 Search"}
          </button>
        </div>
      </div>
      {searched && !result && <div className="alert alert-danger">IMEI not found in registry.</div>}
      {result && (
        <div className="card" style={{ borderLeft: `4px solid ${result.status === "clean" ? "#16A34A" : "#DC2626"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: text }}>{result.imei}</div>
              <div style={{ color: text, opacity: 0.7, fontSize: 13, marginTop: 2 }}>{result.brand} {result.model} · {result.color || "—"}</div>
            </div>
            <span style={{
              padding: "4px 14px", borderRadius: 100, fontSize: 13, fontWeight: 700,
              background: result.status === "clean" ? "#F0FDF4" : "#FEF2F2",
              color: result.status === "clean" ? "#16A34A" : "#DC2626"
            }}>{result.status === "clean" ? "✅ Clean" : "🚨 " + result.status.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 13, color: text, opacity: 0.7 }}>
            Registered: {new Date(result.registered_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}

function LawCases({ incidents, devices, loading, text, subtext, border, dark }) {
  const deviceMap = Object.fromEntries(devices.map(d => [d.imei, d]))

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>Cases</h1>
      {loading ? <div style={{ color: subtext }}>Loading...</div> : incidents.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>No cases reported yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                {["Reported", "Type", "Device", "IMEI", "Location", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                    color: subtext, textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => {
                const device = deviceMap[inc.imei]
                const currentStatus = device?.status || inc.type
                return (
                  <tr key={inc.id} style={{ borderBottom: i < incidents.length - 1 ? `1px solid ${border}` : "none" }}>
                    <td style={{ padding: "12px 16px", color: subtext }}>{new Date(inc.reported_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px", color: text }}>{inc.type.charAt(0).toUpperCase() + inc.type.slice(1)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: text }}>{device ? `${device.brand} ${device.model}` : "—"}</td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: subtext }}>{inc.imei}</td>
                    <td style={{ padding: "12px 16px", color: subtext }}>{inc.location || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                        background: currentStatus === "recovered" ? "#EFF6FF" : "#FEF2F2",
                        color: currentStatus === "recovered" ? "#1A56A8" : "#DC2626"
                      }}>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}