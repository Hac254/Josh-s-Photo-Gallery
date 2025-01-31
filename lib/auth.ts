import * as jose from "jose"

export async function generateJWT() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error("Missing Google credentials")
  }

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600 // Token expires in 1 hour

  return new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/drive.readonly",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setIssuer(clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .sign(await jose.importPKCS8(privateKey, "RS256"))
}

