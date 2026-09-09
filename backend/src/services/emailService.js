const fs = require('fs');
const path = require('path');
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
  const codigoEspaciado = codigo.split('').join(' ');

  // 1. Rutas de tus archivos en la carpeta assets (ajusta si es necesario)
  const logoPath = path.join(__dirname, '/assets/logo-mark-white.png');
  const logoBuffer = fs.readFileSync(logoPath);

  // Ruta de tu imagen de fondo (cambia el nombre si tu archivo se llama diferente)
  const fondoPath = path.join(__dirname, '/assets/email-bg.png');
  const fondoBuffer = fs.readFileSync(fondoPath);

  await transporter.sendMail({
    from: `"SUWA App" <${process.env.GMAIL_USER}>`,
    to: correo,
    subject: '🌱 Código para restablecer tu contraseña — SUWA',
    
    // 2. Adjuntamos AMBAS imágenes y les damos un cid único a cada una
    attachments: [
      {
        filename: 'logo-mark-white.png',
        content: logoBuffer,
        cid: 'logo_suwa'
      },
      {
        filename: 'email-bg.png',
        content: fondoBuffer,
        cid: 'fondo_suwa' // Identificador para el fondo
      }
    ],

    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { background-color: #f1f8f3 !important; margin: 0; padding: 0; }
        </style>
      </head>
      <body style="margin:0;padding:0;background-color:#f1f8f3;font-family:Arial,sans-serif;">
        
        <!-- 3. Aplicamos la imagen de fondo con background-image usando el cid -->
        <table width="100%" cellpadding="0" cellspacing="0" 
          style="background-color:#f1f8f3; 
                 background-image: url('cid:fondo_suwa'); 
                 background-size: cover; 
                 background-position: center; 
                 padding: 50px 0;">
          <tr>
            <td align="center">
              
              <table width="460" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:0px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);">

                <tr>
                  <td align="center" style="background-color:#469d58;padding:36px 20px;">
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td valign="middle">
                          <h1 style="margin:0;color:#ffffff;font-size:32px;letter-spacing:2px;font-family:Georgia,serif;">SUWA</h1>
                        </td>
                        <td valign="middle" style="padding-left:8px;">
                          <img src="cid:logo_suwa" alt="Logo" style="width:36px;height:36px;display:block;"/>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:6px 0 0;color:#b3dbbe;font-size:12px;letter-spacing:0.5px;">Sistema de Riego Automático</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px 48px;">
                    <p style="margin:0 0 16px;color:#333333;font-size:15px;">Hola,</p>
                    <p style="margin:0 0 32px;color:#555555;font-size:14px;line-height:1.6;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta en SUWA. Usa el siguiente código para continuar:
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="display:inline-block;background-color:#f0f7f2;border:1px solid #469d58;
                            border-radius:6px;padding:20px 40px;">
                            <span style="font-size:28px;font-weight:bold;color:#469d58;
                              letter-spacing:8px;margin-left:8px;">${codigoEspaciado}</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 36px;color:#777777;font-size:12px;text-align:center;">
                      <span style="font-size:14px;vertical-align:middle;margin-right:4px;">⏱️</span>
                      Este código expira en <strong>15 minutos</strong>.
                    </p>

                    <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 20px;"/>
                    <p style="margin:0;color:#aaaaaa;font-size:11px;text-align:center;line-height:1.5;">
                      Si no solicitaste restablecer tu contraseña, ignora este correo.<br/>
                      © 2026 SUWA · FET Neiva, Huila · Colombia
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

module.exports = { generarCodigo, enviarCodigoRecuperacion };