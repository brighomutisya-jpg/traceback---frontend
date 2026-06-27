const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export async function lookupDevice(imei) {
  const res = await fetch(`${API}/devices/${imei}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Lookup failed")
  return res.json()
}

export async function registerDevice(data) {
  const res = await fetch(`${API}/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Registration failed")
  }
  return res.json()
}

export async function reportIncident(data) {
  const res = await fetch(`${API}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Report failed")
  }
  return res.json()
}export async function getUserDevices(ownerId) {
  const res = await fetch(`${API}/users/${ownerId}/devices`)
  if (!res.ok) throw new Error("Failed to load devices")
  return res.json()
}export async function getDeviceIncidents(imei) {
  const res = await fetch(`${API}/devices/${imei}/incidents`)
  if (!res.ok) return []
  return res.json()
}

export async function getAllDevices() {
  const res = await fetch(`${API}/registry`)
  if (!res.ok) throw new Error("Failed to load registry")
  return res.json()
}

export async function getAllIncidents() {
  const res = await fetch(`${API}/incidents`)
  if (!res.ok) throw new Error("Failed to load incidents")
  return res.json()
}

export async function logCheck(data) {
  const res = await fetch(`${API}/checks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error("Failed to log check")
  return res.json()
}

export async function getChecks() {
  const res = await fetch(`${API}/checks`)
  if (!res.ok) throw new Error("Failed to load checks")
  return res.json()
}