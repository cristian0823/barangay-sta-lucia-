// Supabase Edge Function: send-otp
// Deploy via Supabase Dashboard → Edge Functions → New Function → paste this code
// Then set environment variable: RESEND_API_KEY = your key from resend.com

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { to_email, otp_code } = await req.json();

    if (!to_email || !otp_code) {
      return new Response(
        JSON.stringify({ error: "Missing to_email or otp_code" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Fetch from Supabase Secrets to prevent GitHub secret scanner from instantly revoking the key
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured. Set RESEND_API_KEY inside Supabase." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Send email via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Barangay Sta. Lucia <onboarding@resend.dev>",
        to: [to_email],
        subject: "Your Password Reset Code - Barangay Sta. Lucia",
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 28px;">🏛️</div>
              <h1 style="color: #064e3b; font-size: 22px; margin: 12px 0 4px;">Barangay Sta. Lucia</h1>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Community Services Portal</p>
            </div>

            <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">Your password reset code is:</p>
              <div style="background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; margin: 16px 0;">
                <span style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #064e3b; font-family: monospace;">${otp_code}</span>
              </div>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">Do not share this code with anyone.</p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
              If you did not request this, please ignore this email.<br>
              — Barangay Sta. Lucia IT Team
            </p>
          </div>
        `,
      }),
    });

    const result = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to send email. Provider error." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully via Resend." }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Server error. Please try again." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
