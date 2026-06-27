import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "./supabaseClient"

export default function ProtectedRoute({ children, allowedRoles }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
  if (!session) return <Navigate to="/login" replace />

  if (allowedRoles) {
    const role = session.user.user_metadata?.role || "owner"
    if (!allowedRoles.includes(role)) {
      return (
        <div style={{ padding: 60, textAlign: "center" }}>
          <h2 style={{ marginBottom: 8 }}>Access restricted</h2>
          <p style={{ opacity: 0.7 }}>Your account doesn't have permission to view this page.</p>
        </div>
      )
    }
  }

  return children
}