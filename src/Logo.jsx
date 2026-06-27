export default function Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: "linear-gradient(135deg, #38BDF8, #818CF8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    </div>
  )
}