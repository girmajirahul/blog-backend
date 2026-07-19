import  transporter  from "../config/mail.config.js";

export async function sendWelcomeEmail(email) {
    const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to BlogCMS Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    You're subscribed! Welcome to the BlogCMS developer newsletter 🎉
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fb;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Email card -->
        <table width="560" cellpadding="0" cellspacing="0" border="0"
          style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- ═══════════ HEADER ═══════════ -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9 0%,#db2777 100%);padding:36px 40px;text-align:center;position:relative;">

              <!-- Logo row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border-radius:10px;width:34px;height:34px;text-align:center;vertical-align:middle;">
                          <span style="color:white;font-size:18px;line-height:34px;">✦</span>
                        </td>
                        <td style="padding-left:8px;">
                          <span style="color:white;font-size:19px;font-weight:800;letter-spacing:-0.02em;">
                            Blog<span style="opacity:0.7;">CMS</span>
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>


              <h1 style="color:#ffffff;margin:0 0 8px;font-size:24px;font-weight:800;letter-spacing:-0.02em;">
                You're subscribed! 
              </h1>
              <p style="color:rgba(255,255,255,0.75);margin:0;font-size:14px;line-height:1.5;">
                Welcome to the BlogCMS developer newsletter
              </p>
            </td>
          </tr>

          <!-- ═══════════ BODY ═══════════ -->
          <tr>
            <td style="padding:32px 40px;">

              <!-- Greeting -->
              <p style="color:#111827;font-size:15px;line-height:1.7;margin:0 0 8px;font-weight:600;">
                Hey there, developer 👋
              </p>
              <p style="color:#4b5563;font-size:14px;line-height:1.75;margin:0 0 28px;">
                Thanks for joining <strong style="color:#6d28d9;">50,000+</strong> developers who get
                the best tech content delivered straight to their inbox every week.
                You're going to love what's coming!
              </p>

              <!-- ─── What to expect box ─── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#f9f7ff;border:1px solid #ede9fe;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#5b21b6;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">
                      What you'll get
                    </p>

                    <!-- Item 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:30px;height:30px;background:#ede9fe;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">
                            🚀
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="color:#374151;font-size:13px;line-height:1.5;">
                            <strong style="color:#111827;">Latest tech tutorials</strong> — every week, no fluff
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:30px;height:30px;background:#fce7f3;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">
                            💡
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="color:#374151;font-size:13px;line-height:1.5;">
                            <strong style="color:#111827;">Career tips</strong> — from senior devs who've been there
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:30px;height:30px;background:#ecfdf5;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">
                            🔥
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="color:#374151;font-size:13px;line-height:1.5;">
                            <strong style="color:#111827;">Trending posts</strong> — curated from the community
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Item 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:30px;height:30px;background:#f0fdf4;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">
                            🔒
                          </div>
                        </td>
                        <td style="padding-left:12px;vertical-align:middle;">
                          <span style="color:#374151;font-size:13px;line-height:1.5;">
                            <strong style="color:#111827;">Zero spam</strong> — unsubscribe anytime, no questions
                          </span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ─── Latest post teaser ─── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="44" valign="top">
                          <div style="width:40px;height:40px;background:linear-gradient(135deg,#6d28d9,#db2777);border-radius:10px;text-align:center;line-height:40px;font-size:18px;">
                            📄
                          </div>
                        </td>
                        <td style="padding-left:14px;vertical-align:top;">
                          <p style="color:#6d28d9;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px;">
                            Latest post
                          </p>
                          <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 4px;line-height:1.4;">
                            Building Scalable REST APIs with Node.js
                          </p>
                          <p style="color:#6b7280;font-size:11px;margin:0;">
                            8 min read &nbsp;·&nbsp; Node.js &nbsp;·&nbsp; API &nbsp;·&nbsp; Backend
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ─── Stats row ─── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:0 4px;">
                    <div style="background:#f9f7ff;border:1px solid #ede9fe;border-radius:10px;padding:14px 8px;">
                      <p style="color:#6d28d9;font-size:20px;font-weight:800;margin:0 0 2px;">50K+</p>
                      <p style="color:#7c3aed;font-size:10px;margin:0;">Readers</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 4px;">
                    <div style="background:#fdf2f8;border:1px solid #fce7f3;border-radius:10px;padding:14px 8px;">
                      <p style="color:#db2777;font-size:20px;font-weight:800;margin:0 0 2px;">1.2K+</p>
                      <p style="color:#be185d;font-size:10px;margin:0;">Articles</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:0 4px;">
                    <div style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:10px;padding:14px 8px;">
                      <p style="color:#059669;font-size:20px;font-weight:800;margin:0 0 2px;">300+</p>
                      <p style="color:#047857;font-size:10px;margin:0;">Authors</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- ─── CTA Button ─── -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${FRONTEND_URL}"
                      style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#db2777);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:-0.01em;">
                      Browse Latest Posts →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              

            </td>
          </tr>

          <!-- ═══════════ FOOTER ═══════════ -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:18px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;line-height:1.6;">
                You subscribed with
                <strong style="color:#6b7280;">${email}</strong>
              </p>
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                © 2026 BlogCMS &nbsp;·&nbsp;
                <a href="${FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}"
                  style="color:#6d28d9;text-decoration:none;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${FRONTEND_URL}/privacy"
                  style="color:#6d28d9;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? `BlogCMS <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You're subscribed to BlogCMS Newsletter!",
        html,
    });
}
