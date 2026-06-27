import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllDevices, getAllIncidents } from "../api"
import { useTheme } from "../App"

export default function AdminPortal() {
  const [tab, setTab] = useState("dashboard")
  const [devices, setDevices] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"

  async function refresh() {
    setLoading(true)
    try {
      const [d, i] = await Promise.all([getAllDevices(), getAllIncidents()])
      setDevices(d)
      setIncidents(i)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  const bg = dark ? "#070B14" : "#F8FAFC"
  const sidebarBg = dark ? "#0B1120" : "white"
  const border = dark ? "rgba(255,255,255,0.08)" : "#E2E8F0"
  const text = dark ? "#E2E8F0" : "#1E293B"
  const subtext = dark ? "#94A3B8" : "#64748B"

  const statusStyle = {
    clean: { background: "#F0FDF4", color: "#16A34A" },
    stolen: { background: "#FEF2F2", color: "#DC2626" },
    lost: { background: "#FFFBEB", color: "#D97706" },
    recovered: { background: "#EFF6FF", color: "#1A56A8" },
  }

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)", background: bg }}>
      <aside style={{ width: 210, background: sidebarBg, borderRight: `1px solid ${border}`, padding: "16px 0", flexShrink: 0 }}>
        {[
          { id: "dashboard", icon: "🏠", label: "Dashboard" },
          { id: "registry", icon: "🗄️", label: "IMEI Registry" },
          { id: "activity", icon: "⚡", label: "Activity Log" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 16px", border: "none",
            background: tab === item.id ? (dark ? "rgba(220,38,38,0.1)" : "#FFF1F2") : "none",
            color: tab === item.id ? "#DC2626" : subtext,
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
        {tab === "dashboard" && <AdminDashboard devices={devices} incidents={incidents} loading={loading} text={text} subtext={subtext} />}
        {tab === "registry" && <AdminRegistry devices={devices} loading={loading} text={text} subtext={subtext} border={border} dark={dark} statusStyle={statusStyle} />}
        {tab === "activity" && <AdminActivity incidents={incidents} devices={devices} loading={loading} text={text} subtext={subtext} border={border} dark={dark} statusStyle={statusStyle} />}
      </main>
    </div>
  )
}

function AdminDashboard({ devices, incidents, loading, text, subtext }) {
  const stolen = devices.filter(d => d.status === "stolen").length
  const lost = devices.filter(d => d.status === "lost").length
  const clean = devices.filter(d => d.status === "clean").length
  const recovered = devices.filter(d => d.status === "recovered").length
  const recoveryRate = (stolen + lost + recovered) > 0
    ? Math.round((recovered / (stolen + lost + recovered)) * 100)
    : 0

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: text }}>Admin Dashboard</h1>
      <p style={{ color: subtext, marginBottom: 24 }}>TraceBack Registry — Platform Operations Overview</p>

      {loading ? <div style={{ color: subtext }}>Loading registry data...</div> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total IMEIs", value: devices.length, color: "#38BDF8" },
              { label: "Active Stolen/Lost", value: stolen + lost, color: "#DC2626" },
              { label: "Recovery Rate", value: recoveryRate + "%", color: "#16A34A" },
              { label: "Total Incidents", value: incidents.length, color: "#D97706" },
            ].map(s => (
              <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, marginBottom: 0 }}>
                <div style={{ fontSize: 11, color: subtext, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: text }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: text }}>Registry breakdown</div>
              {[
                ["Clean", clean, "#16A34A"],
                ["Stolen", stolen, "#DC2626"],
                ["Lost", lost, "#D97706"],
                ["Recovered", recovered, "#38BDF8"],
              ].map(([label, count, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <span style={{ fontSize: 13, color: text }}>{label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color }}>{count}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: text }}>Most recent incidents</div>
              {incidents.length === 0 ? (
                <div style={{ color: subtext, fontSize: 13 }}>No incidents reported yet.</div>
              ) : incidents.slice(0, 5).map(inc => (
                <div key={inc.id} style={{ padding: "6px 0", borderBottom: `1px solid rgba(255,255,255,0.05)`, fontSize: 13 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: subtext }}>{inc.imei}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: text }}>
                    <span>{inc.type.charAt(0).toUpperCase() + inc.type.slice(1)} · {inc.location || "Unknown"}</span>
                    <span style={{ color: subtext }}>{new Date(inc.reported_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AdminRegistry({ devices, loading, text, subtext, border, dark, statusStyle }) {
  const [search, setSearch] = useState("")
  const filtered = devices.filter(d =>
    d.imei.includes(search) ||
    (d.brand || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.model || "").toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: text }}>IMEI Registry</h1>
        <input className="input" placeholder="Search IMEI, brand, or model..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260, marginTop: 0 }} />
      </div>
      {loading ? <div style={{ color: subtext }}>Loading...</div> : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>No devices found.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                {["IMEI", "Device", "Colour", "Status", "Registered"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                    color: subtext, textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.imei} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: subtext }}>{d.imei}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: text }}>{d.brand} {d.model}</td>
                  <td style={{ padding: "12px 16px", color: subtext }}>{d.color || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, ...statusStyle[d.status] }}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: subtext, fontSize: 13 }}>
                    {new Date(d.registered_at).toLocaleDateString()}
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

function AdminActivity({ incidents, devices, loading, text, subtext, border, dark, statusStyle }) {
  const deviceMap = Object.fromEntries(devices.map(d => [d.imei, d]))
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>Activity Log</h1>
      {loading ? <div style={{ color: subtext }}>Loading...</div> : incidents.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>No activity recorded yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                {["Time", "Type", "IMEI", "Device", "Location"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                    color: subtext, textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => {
                const device = deviceMap[inc.imei]
                return (
                  <tr key={inc.id} style={{ borderBottom: i < incidents.length - 1 ? `1px solid ${border}` : "none" }}>
                    <td style={{ padding: "12px 16px", color: subtext }}>{new Date(inc.reported_at).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600, ...statusStyle[inc.type] }}>
                        {inc.type.charAt(0).toUpperCase() + inc.type.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: subtext }}>{inc.imei}</td>
                    <td style={{ padding: "12px 16px", color: text }}>{device ? `${device.brand} ${device.model}` : "—"}</td>
                    <td style={{ padding: "12px 16px", color: subtext }}>{inc.location || "—"}</td>
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