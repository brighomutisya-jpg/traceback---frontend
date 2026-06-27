import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://sqrbmrofqelgxsvugkap.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcmJtcm9mcWVsZ3hzdnVna2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTg0NjUsImV4cCI6MjA5NzA5NDQ2NX0.90QgYJy2HzaHbZtno5BKl0Hah27rqIGs8FCe6MgNhvo"

export const supabase = createClient(supabaseUrl, supabaseKey)