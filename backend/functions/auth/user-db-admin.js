import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { AppError } from "../common/AppError.js";
import { getAuth, UserRecord } from "firebase-admin/auth";

const credJson = {
  "type": "service_account",
  "project_id": "oneshot-c5e23",
  "private_key_id": "3c4c440ad68b19c8d87fa98723b7fb1188528f20",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyCjWigS8SpTVb\nLrjmlZQIlj64UnKkSeM2t/XWLEwPDKUv4Nsh+3bLTm1UoUdAVySJo5YPAuPJurow\n+1OSN78euSuysNP0sNvP+WQOz2YEtXNEhrfVlVZDUPb938YufOfMIpU3Otx71p2W\n3AjOiXRaVK6rc756qGEuHUc509ephQK/EeRHLWl6b/oMVz7v0RZqGw9yejkn4z3g\nIjgYaM/isLcWVChkM5TqNYo18ZG629+LXCCPMKlVS65kH2Tmpf3yuIuK/QSPSW8r\ndmg0If9y1xJzC+rmMKA8XSQIboD0k0QWgmuxeubvWugosfMQJkErSwpreXa35ogA\nBGYzcYUdAgMBAAECggEAC6znOQWrOlgKsHTXK8nl2A1QRiKkAXmV9KXqMXYcs8Ty\nxTnD7Q3SS8FUIp9j7oh4bS1E3y2jlfxQjvtATv+oYSGoB7MYZzy84X3bjawUptzm\nVvlVr2Q4cLgrxljJJI3M3qJq8iECSf24PmcmDbNOZckVXkl8FYuaud0yKUzm4Ocr\nxZNa7bIFkCyG5HKmpnix5tas9AEw9Wet1lFeBBswRaweg/gutGwbX7NDWlDH/fG9\n6RB5AX0HFfLYbxJ8LzgWwsSK60r19vxmK5YdNS/lr9KSjPIRFTkZ1mf8+tiq1v8F\nE99lcA/TL8FzqQSc8ssA7a5NByR5bowzdGWcenVhWQKBgQDlIIuxxRXNtTJqZoV3\nq8ZcBaK3QS4RA/AeKENBS1zjfZYEFAZkWJ0gPcEDpBW072G0zfv88Yr7SSDp7FWe\nVqXrqHazbOnmD+mqXr0QHOwbbRnB6C2BrKV3yLnrRrT+6SZPo0Rql8HmG6KzbLBI\nrhcBXsubwMsJ3BDoAXIZ8OGICQKBgQDG68nopKxb+ny2Su8YC4IPtDWklxZXT55J\nlBbgb3xkMMgwZ7fT4jNVyQYaGGVK9rVPT1lfy3OUlZ6s0zoWR406swQMVkCr/Ch/\nPggO2eVZm4wuIIlRuT4EMMFaoUCbi0cRBLvdIAVhxBcR56rCvHvTLxxRHEYPovS0\nE8Xnh5fRdQKBgGLcUQnp5Id2WANqqsnAtvx7fgKdv/edgFwyuRoSH0kUpcaqsTtY\ntKr1mjMs+CSyaLDvc3tm6LWVjvr/es2vyzVL4bN3GdCnKwXUjLTIFeObhlKREBl0\nWYy+ceGfB3c5N8uCwYFQa1wSrnfGPKWPX+O6eBWC8NgXOMAx535j3ZupAoGAc5tF\nVPefVDVXlXonSoolpIrPQkCss0GKdKikQvuIB5JyRe+BXprvysNx0GitNcv7w4QS\nJSJQoeHyve5kq94ZriusBp96Jnn97zVV6YupR1KnPYebRuuppzXOqaVdrwha3QEr\nTW/2sMMNxVImY9a3AB05D8qmzR+fp6h2NAERsqECgYBRqe6/UX3GQ/dQit/xPAI6\nyvvVIESGwXOzhQi6YhwPCred5rFJL9rcUjKoJeqh2c6xR1VPo6jJ+b4BpESPwlvJ\niuleJoGL3PKZ/tlwOqxI5XoGmmUn80UQ1zcje1XuBlchQLDPrbFyj8bHWAspUfBl\n5cyYSMvFlfa2Tljz3x9WJA==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@oneshot-c5e23.iam.gserviceaccount.com",
  "client_id": "117563772918708592588",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40oneshot-c5e23.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

export const appOneShot = initializeApp({ credential: admin.credential.cert(credJson) },
  'oneshot'
);

/**
 * Checks auth
 * @param {Request} req 
 * @param {Response} res 
 * @returns {Promise<UserRecord>} returns the current user id
 */
export const getUser = async (req, res) => {
  try {
    const authorizationHeader = req.headers?.authorization;
    const idToken = authorizationHeader?.split('Bearer ')?.[1];
    if (!idToken) {
      throw new AppError('Authentication required. Please provide a valid Bearer token.', 401)
    }

    const authOneShot = getAuth(appOneShot)
    const decodedToken = await authOneShot.verifyIdToken(idToken)
    const uid = decodedToken.uid;
    const user = await authOneShot.getUser(uid)
    return user

  } catch (error) {
    throw new AppError("Authentication failed.", 401)
  }
}

/**
 * Checks auth and returns the user object. If not signed in then it will set the response status to an error code and output a json error message, and return undefined
 * @param {Request} req 
 * @param {Response} res 
 * @returns {Promise<UserRecord> | undefined} returns the current user or undefined
 */
export const getUserOrFail = async (req, res) => {
  try {
    return await getUser(req, res)
  } catch (error) {
    res.status(error.code ?? 500).json({ error: error.message })
    return
  }
}