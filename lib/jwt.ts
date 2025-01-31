import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signToken(payload: any, expiresIn: string = '24h') {
  const exp = Math.floor(Date.now() / 1000) + (
    expiresIn === '24h' ? 24 * 60 * 60 : parseInt(expiresIn)
  )
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
} 