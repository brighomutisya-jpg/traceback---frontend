import { useState } from "react"
import { reportIncident } from "../api"

export default function Report() {
  const [form, setForm] = useState({ imei: "", type: "stolen", location: "", description: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.imei) {
      setError("IMEI is required.")
      return
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await reportIncident(form)
      setSuccess(`🚨 Report submitted. IMEI ${form.imei} is now flagged as ${form.type} in the registry. MNOs will be notified.`)
      setForm({ imei: "", type: "stolen", location: "", description: "" })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: "inherit" }}>Report a Device</h1>
      <p style={{ color: "#64748B", marginBottom: 24 }}>
        Report your device as lost or stolen. It will be flagged immediately in the registry.
      </p>

      <div className="alert alert-danger" style={{ marginBottom: 20 }}>
        ⚠️ <strong>Safety first.</strong> Do not confront the thief. File a police report alongside this.
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card">
        <div className="form-group">
          <label>IMEI Number *</label>
          <input className="input" name="imei" placeholder="15-digit IMEI of the stolen device"
            value={form.imei} onChange={handleChange} maxLength={15} />
        </div>
        <div className="form-group">
          <label>Incident Type *</label>
          <select className="input" name="type" value={form.type} onChange={handleChange}>
            <option value="stolen">Stolen</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="form-group">
          <label>Last Known Location</label>
          <input className="input" name="location" placeholder="e.g. Nairobi CBD, Kenya"
            value={form.location} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>What happened?</label>
          <textarea className="input" name="description"
            placeholder="Briefly describe the incident..."
            value={form.description} onChange={handleChange}
            rows={4} style={{ resize: "vertical" }} />
        </div>
        <button className="btn btn-danger" onClick={handleSubmit}
          disabled={loading} style={{ width: "100%" }}>
          {loading ? "Submitting..." : "🚨 Submit report"}
        </button>
      </div>
    </div>
  )
}