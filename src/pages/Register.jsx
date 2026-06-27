import { useState } from "react"
import { registerDevice } from "../api"

export default function Register() {
  const [form, setForm] = useState({ imei: "", brand: "", model: "", color: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.imei || !form.brand || !form.model) {
      setError("IMEI, brand and model are required.")
      return
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await registerDevice(form)
      setSuccess(`✅ Device registered! IMEI ${form.imei} is now protected in the TraceBack registry.`)
      setForm({ imei: "", brand: "", model: "", color: "" })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: "inherit" }}>Register a Device</h1>
      <p style={{ color: "#64748B", marginBottom: 24 }}>
        Pre-register your device so it can be traced immediately if lost or stolen.
      </p>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card">
        <div className="form-group">
          <label>IMEI Number *</label>
          <input className="input" name="imei" placeholder="Dial *#06# to find your IMEI"
            value={form.imei} onChange={handleChange} maxLength={15} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Brand *</label>
            <select className="input" name="brand" value={form.brand} onChange={handleChange}>
              <option value="">Select...</option>
              {["Apple","Samsung","Tecno","Infinix","Huawei","Nokia","Oppo","Other"].map(b => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Model *</label>
            <input className="input" name="model" placeholder="e.g. iPhone 14 Pro"
              value={form.model} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Colour</label>
          <input className="input" name="color" placeholder="e.g. Space Black"
            value={form.color} onChange={handleChange} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}
          disabled={loading} style={{ width: "100%" }}>
          {loading ? "Registering..." : "📱 Register device"}
        </button>
      </div>
    </div>
  )
}