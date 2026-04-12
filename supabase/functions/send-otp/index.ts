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

    // Use EmailJS REST API instead of Resend to bypass SMTP rate limitations
    // Service: service_th96vue | Template: template_l72erqi | Public Key (user_id): 0ASAHR2pXehhPYi62baDZ
    const emailJsRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        service_id: "service_th96vue",
        template_id: "template_l72erqi",
        user_id: "0ASAHR2pXehhPYi62baDZ",
        template_params: {
          email: to_email,
          otp_code: otp_code
        }
      }),
    });

    // EmailJS returns 'OK' text on success, not JSON
    const resultText = await emailJsRes.text();

    if (!emailJsRes.ok) {
      console.error("EmailJS API error side-effect:", resultText);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Provider rejected the request." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully." }),
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
