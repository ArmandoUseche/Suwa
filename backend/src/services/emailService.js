const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function enviarCodigoRecuperacion(correo, codigo) {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

              <!-- HEADER -->
              <tr>
                <td align="center" style="background:#2d7a4f;padding:32px 40px;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;">SUWA</h1>
                  <p style="margin:6px 0 0;color:#a8d5b5;font-size:13px;">
                    Sistema de Riego Automático
                  </p>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 8px;color:#333;font-size:15px;">Hola,</p>
                  <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en SUWA.
                    Usa el siguiente código para continuar:
                  </p>

                  <!-- CÓDIGO -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:20px 0;">
                        <div style="display:inline-block;background:#f0faf4;border:2px solid #2d7a4f;
                          border-radius:12px;padding:20px 48px;">
                          <span style="font-size:38px;font-weight:700;color:#2d7a4f;
                            letter-spacing:10px;">${codigo}</span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;color:#555;font-size:13px;text-align:center;">
                    ⏱️ Este código expira en <strong>15 minutos</strong>.
                  </p>

                  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>

                  <p style="margin:0;color:#999;font-size:12px;text-align:center;">
                    Si no solicitaste restablecer tu contraseña, ignora este correo.<br/>
                    Tu cuenta sigue segura.
                  </p>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td align="center" style="background:#f9f9f9;padding:16px 40px;
                  border-top:1px solid #eee;">
                  <p style="margin:0;color:#bbb;font-size:11px;">
                    © 2024 SUWA · FET Neiva, Huila · Colombia
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"SUWA App" <${process.env.GMAIL_USER}>`,
    to: correo,
    subject: '🌱 Código para restablecer tu contraseña — SUWA',
    html,
  });
}

module.exports = { generarCodigo, enviarCodigoRecuperacion };