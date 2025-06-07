import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    // TODO: use environment variables for production
    baseURL: "http://localhost:3000"
})