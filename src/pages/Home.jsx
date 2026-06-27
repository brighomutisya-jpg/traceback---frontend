import { useNavigate } from "react-router-dom"
import { useTheme } from "../App"

const portals = [
  { icon: "📱", title: "Device Owner", desc: "Register your device, report theft, and track recovery status.", path: "/owner" },
  { icon: "🔧", title: "Repair Shop & Resellers", desc: "Verify devices before servicing or buying. Stay compliant.", path: "/business-signup" },
]

export default function Home() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const bg = dark ? "#070B14" : "#F8FAFC"
  const text = dark ? "white" : "#0F172A"
  const subtext = dark ? "#94A3B8" : "#64748B"
  const cardBg = dark ? "rgba(255,255,255,0.03)" : "white"
  const cardBorder = dark ? "rgba(255,255,255,0.08)" : "#E2E8F0"

  return (
    <div style={{ background: bg, minHeight: "calc(100vh - 56px)", color: text, width: "100%" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "90px 24px 60px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: dark ? "radial-gradient(circle, rgba(56,189,248,0.12), transparent 70%)" : "none",
          pointerEvents: "none"
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: dark ? "rgba(255,255,255,0.06)" : "#EFF6FF",
          border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #BFDBFE",
          borderRadius: 100, padding: "6px 14px", fontSize: 13, color: subtext, marginBottom: 28
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2DD4BF" }} />
          Live IMEI registry · Built on Supabase
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 58px)", fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-1.5px", marginBottom: 22, color: text
        }}>
          Stolen devices,<br />
          <span style={{
            background: "linear-gradient(90deg, #38BDF8, #818CF8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>made worthless.</span>
        </h1>

        <p style={{ fontSize: 17, color: subtext, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.6 }}>
          TraceBack is the unified IMEI registry connecting owners, mobile carriers,
          law enforcement, and repair shops — turning every stolen phone into a dead end.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <button onClick={() => navigate("/owner")} style={{
            background: "linear-gradient(90deg, #38BDF8, #818CF8)", color: "#0B1120",
            border: "none", padding: "13px 26px", borderRadius: 10,
            fontWeight: 700, fontSize: 15, cursor: "pointer"
          }}>Report a stolen device →</button>
          <button onClick={() => navigate("/lookup")} style={{
            background: dark ? "rgba(255,255,255,0.05)" : "white", color: text,
            border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #CBD5E1",
            padding: "13px 26px", borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: "pointer"
          }}>Check an IMEI</button>
        </div>

        <p style={{ fontSize: 13, color: dark ? "#475569" : "#94A3B8" }}>
          Free for device owners · Secure for law enforcement · API-first for partners
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: text }}>Choose your portal</h2>
          <p style={{ color: subtext, fontSize: 14 }}>Each portal is tailored to a different stakeholder.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {portals.map(p => (
            <div key={p.path}
              onClick={() => navigate(p.path)}
              style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 16, padding: "26px 22px", cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#38BDF8"
                e.currentTarget.style.transform = "translateY(-3px)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = cardBorder
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: dark ? "rgba(56,189,248,0.1)" : "#EFF6FF", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16
              }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: text }}>{p.title}</div>
              <div style={{ color: subtext, fontSize: 13.5, lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}  