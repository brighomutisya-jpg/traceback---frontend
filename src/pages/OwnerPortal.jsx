import { useState, useEffect } from "react"
import { lookupDevice, registerDevice, reportIncident, getUserDevices, getDeviceIncidents } from "../api"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { useTheme } from "../App"

export default function OwnerPortal() {
  const [tab, setTab] = useState("dashboard")
  const [user, setUser] = useState(null)
  const [devices, setDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function refreshDevices() {
    if (!user) return
    setLoadingDevices(true)
    try {
      const data = await getUserDevices(user.id)
      setDevices(data)
    } catch (e) { console.error(e) }
    finally { setLoadingDevices(false) }
  }

  useEffect(() => { if (user) refreshDevices() }, [user])

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
          { id: "devices", icon: "📱", label: "My Devices" },
          { id: "incidents", icon: "🚨", label: "Incidents" },
          { id: "register", icon: "➕", label: "Register Device" },
          { id: "lookup", icon: "🔍", label: "IMEI Lookup" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 16px", border: "none",
            background: tab === item.id ? (dark ? "rgba(56,189,248,0.1)" : "#EFF6FF") : "none",
            color: tab === item.id ? "#38BDF8" : subtext,
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
        {tab === "dashboard" && <OwnerDashboard devices={devices} loading={loadingDevices} setTab={setTab} user={user} dark={dark} text={text} subtext={subtext} />}
        {tab === "devices" && <OwnerDevices devices={devices} loading={loadingDevices} onUpdate={refreshDevices} dark={dark} text={text} subtext={subtext} border={border} />}
        {tab === "incidents" && <OwnerIncidents devices={devices} onUpdate={refreshDevices} dark={dark} text={text} subtext={subtext} border={border} />}
        {tab === "register" && <OwnerRegister user={user} onRegistered={refreshDevices} text={text} />}
        {tab === "lookup" && <OwnerLookup text={text} />}
      </main>
    </div>
  )
}

function OwnerDashboard({ devices, loading, setTab, user, dark, text, subtext }) {
  const stolen = devices.filter(d => d.status !== "clean").length
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: text }}>My Dashboard</h1>
      <p style={{ color: subtext, marginBottom: 24 }}>
        Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Registered Devices", value: devices.length, color: "#38BDF8" },
          { label: "Active Incidents", value: stolen, color: "#DC2626" },
          { label: "Protected IMEIs", value: devices.length, color: "#16A34A" },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: subtext, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: text }}>{s.value}</div>
          </div>
        ))}
      </div>

      {stolen > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          🚨 <strong>You have {stolen} active theft/loss report{stolen > 1 ? "s" : ""}.</strong>
          <span onClick={() => setTab("incidents")} style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 8 }}>
            View incidents →
          </span>
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: text }}>My devices</h2>
      {loading ? (
        <div style={{ color: subtext, fontSize: 14 }}>Loading your devices...</div>
      ) : devices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>
          No devices registered yet. <span onClick={() => setTab("register")} style={{ color: "#38BDF8", fontWeight: 600, cursor: "pointer" }}>Register your first device →</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14 }}>
          {devices.map(d => (
            <div key={d.imei} className="card" style={{
              borderLeft: `3px solid ${d.status === "clean" ? "#16A34A" : "#DC2626"}`,
              marginBottom: 0
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📱</div>
              <div style={{ fontWeight: 700, color: text }}>{d.brand} {d.model}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: subtext, margin: "4px 0 8px" }}>{d.imei}</div>
              <span style={{
                padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                background: d.status === "clean" ? "#F0FDF4" : "#FEF2F2",
                color: d.status === "clean" ? "#16A34A" : "#DC2626"
              }}>
                {d.status === "clean" ? "✅ Clean" : "🚨 " + d.status.charAt(0).toUpperCase() + d.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OwnerDevices({ devices, loading, onUpdate, dark, text, subtext, border }) {
  const [reportingImei, setReportingImei] = useState(null)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>My Devices</h1>
      {loading ? (
        <div style={{ color: subtext }}>Loading...</div>
      ) : devices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>No devices registered yet.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                {["Device", "IMEI", "Colour", "Status", "Registered", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11,
                    color: subtext, textTransform: "uppercase", letterSpacing: 0.5,
                    borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={d.imei} style={{ borderBottom: i < devices.length - 1 ? `1px solid ${border}` : "none" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: text }}>{d.brand} {d.model}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: subtext }}>{d.imei}</td>
                  <td style={{ padding: "12px 16px", color: subtext }}>{d.color || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: d.status === "clean" ? "#F0FDF4" : "#FEF2F2",
                      color: d.status === "clean" ? "#16A34A" : "#DC2626"
                    }}>{d.status === "clean" ? "✅ Clean" : "🚨 " + d.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: subtext, fontSize: 13 }}>
                    {new Date(d.registered_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {d.status === "clean" && (
                      <button className="btn btn-danger" style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => setReportingImei(d.imei)}>🚨 Report</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportingImei && (
        <ReportModal imei={reportingImei} onClose={() => setReportingImei(null)}
          onSuccess={() => { setReportingImei(null); onUpdate(); }} dark={dark} text={text} />
      )}
    </div>
  )
}

function ReportModal({ imei, onClose, onSuccess, dark, text }) {
  const [form, setForm] = useState({ type: "stolen", location: "", description: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    setLoading(true); setError("")
    try {
      await reportIncident({ imei, ...form })
      onSuccess()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
    }} onClick={onClose}>
      <div style={{
        background: dark ? "#0F172A" : "white", borderRadius: 14, width: 460, maxWidth: "90%", padding: 24,
        border: dark ? "1px solid rgba(255,255,255,0.1)" : "none"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: text }}>🚨 Report this device</div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: dark ? "rgba(255,255,255,0.1)" : "#F1F5F9", cursor: "pointer", fontSize: 14, color: text
          }}>✕</button>
        </div>

        <div style={{
          background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
          padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16
        }}>⚠️ Do not confront the thief. File a police report alongside this.</div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <div className="form-group">
          <label>IMEI</label>
          <input className="input" value={imei} disabled style={{ fontFamily: "monospace" }} />
        </div>
        <div className="form-group">
          <label>Incident Type</label>
          <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="stolen">Stolen</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="form-group">
          <label>Last known location</label>
          <input className="input" placeholder="e.g. Nairobi CBD, Kenya"
            value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
        <div className="form-group">
          <label>What happened?</label>
          <textarea className="input" rows={3} placeholder="Briefly describe the incident..."
            value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            style={{ resize: "vertical" }} />
        </div>

        <button className="btn btn-danger" onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Submitting..." : "🚨 Submit report"}
        </button>
      </div>
    </div>
  )
}

function OwnerIncidents({ devices, onUpdate, dark, text, subtext, border }) {
  const flagged = devices.filter(d => d.status !== "clean")
  const [incidentData, setIncidentData] = useState({})

  useEffect(() => {
    flagged.forEach(d => {
      getDeviceIncidents(d.imei).then(data => {
        setIncidentData(prev => ({ ...prev, [d.imei]: data[0] }))
      })
    })
  }, [devices])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>Incidents</h1>
      {flagged.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: subtext }}>
          ✅ No active incidents. All your devices are clean.
        </div>
      ) : (
        flagged.map(d => {
          const incident = incidentData[d.imei]
          return (
            <div key={d.imei} className="card" style={{ borderLeft: "4px solid #DC2626" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: text }}>{d.brand} {d.model}</div>
                  <div style={{ color: subtext, fontSize: 13, marginTop: 2, fontFamily: "monospace" }}>{d.imei}</div>
                </div>
                <span style={{ background: "#FEF2F2", color: "#DC2626", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                  🚨 {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                </span>
              </div>
              {incident && (
                <div style={{ fontSize: 13, color: text }}>
                  {[
                    ["Reported", new Date(incident.reported_at).toLocaleString()],
                    ["Location", incident.location || "Not specified"],
                    ["Description", incident.description || "—"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: `1px solid ${border}` }}>
                      <span style={{ color: subtext, width: 100, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

function OwnerRegister({ user, onRegistered, text }) {
  const [form, setForm] = useState({ imei: "", brand: "", model: "", color: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!form.imei || !form.brand || !form.model) { setError("IMEI, brand and model are required."); return }
    if (!user) { setError("You must be logged in to register a device."); return }
    setLoading(true); setError(""); setSuccess("")
    try {
      await registerDevice({ ...form, owner_id: user.id })
      setSuccess(`✅ Device registered! IMEI ${form.imei} is now protected.`)
      setForm({ imei: "", brand: "", model: "", color: "" })
      onRegistered()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>Register a Device</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      <div className="card">
        <div className="form-group">
          <label>IMEI Number *</label>
          <input className="input" placeholder="Dial *#06# to find your IMEI"
            value={form.imei} onChange={e => setForm({...form, imei: e.target.value})} maxLength={15} />
        </div>
        <div className="form-group">
          <label>Brand *</label>
          <select className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
            <option value="">Select...</option>
            {["Apple","Samsung","Tecno","Infinix","Huawei","Nokia","Other"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Model *</label>
          <input className="input" placeholder="e.g. iPhone 14 Pro"
            value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Colour</label>
          <input className="input" placeholder="e.g. Space Black"
            value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Registering..." : "📱 Register device"}
        </button>
      </div>
    </div>
  )
}

function OwnerLookup({ text }) {
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
    <div style={{ maxWidth: 500 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: text }}>IMEI Lookup</h1>
      <div className="card">
        <div className="form-group">
          <label>IMEI Number</label>
          <input className="input" placeholder="Enter 15-digit IMEI"
            value={imei} onChange={e => setImei(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLookup()} />
        </div>
        <button className="btn btn-primary" onClick={handleLookup} disabled={loading} style={{ width: "100%" }}>
          {loading ? "Checking..." : "🔍 Check IMEI"}
        </button>
      </div>
      {searched && !result && <div className="alert alert-danger">IMEI not found in registry.</div>}
      {result && (
        <div className="card" style={{ borderLeft: `4px solid ${result.status === "clean" ? "#16A34A" : "#DC2626"}` }}>
          <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, marginBottom: 12, color: text }}>{result.imei}</div>
          <span style={{
            padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 700,
            background: result.status === "clean" ? "#F0FDF4" : "#FEF2F2",
            color: result.status === "clean" ? "#16A34A" : "#DC2626"
          }}>{result.status === "clean" ? "✅ Clean" : "🚨 " + result.status.toUpperCase()}</span>
          <div style={{ marginTop: 12, fontSize: 14, color: text }}>
            <div><strong>{result.brand} {result.model}</strong></div>
            <div>{result.color}</div>
          </div>
        </div>
      )}
    </div>
  )
}