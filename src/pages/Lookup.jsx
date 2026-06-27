import { useState } from "react"
import { lookupDevice } from "../api"

export default function Lookup() {
  const [imei, setImei] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  async function handleLookup() {
    if (!imei || imei.length < 10) {
      setError("Please enter a valid IMEI number")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    setSearched(false)
    try {
      const data = await lookupDevice(imei.trim())
      setResult(data)
      setSearched(true)
    } catch (e) {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6,color:"inherit" }}>IMEI Lookup</h1>
      <p style={{ color: "#64748B", marginBottom: 24 }}>
        Check if a device is registered as lost or stolen before buying or repairing it.
      </p>

      <div className="card">
        <div className="form-group">
          <label>IMEI Number</label>
          <input
            className="input"
            type="text"
            placeholder="Enter 15-digit IMEI (dial *#06# on device)"
            value={imei}
            maxLength={15}
            onChange={e => setImei(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleLookup}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Checking..." : "🔍 Check IMEI"}
        </button>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {searched && result === null && (
        <div className="alert alert-danger">
          <strong>Not in registry</strong><br />
          This IMEI has no record in TraceBack. If you own this device, register it for protection.
        </div>
      )}

      {result && (
        <div className="card" style={{
          borderLeft: `4px solid ${result.status === "clean" ? "#16A34A" : "#DC2626"}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700 }}>
              {result.imei}
            </span>
            <span style={{
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              background: result.status === "clean" ? "#F0FDF4" : "#FEF2F2",
              color: result.status === "clean" ? "#16A34A" : "#DC2626",
            }}>
              {result.status === "clean" ? "✅ Clean" : "🚨 " + result.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Brand", result.brand],
              ["Model", result.model],
              ["Colour", result.color || "—"],
              ["Registered", new Date(result.registered_at).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
          {result.status !== "clean" && (
            <div className="alert alert-danger" style={{ marginTop: 16, marginBottom: 0 }}>
              🚨 <strong>Do not purchase or service this device.</strong> It has been reported {result.status}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}