import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function POST() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Delete user via Clerk server SDK
    const client = await clerkClient()
    await client.users.deleteUser(userId)
    return NextResponse.json({ deleted: true }, { status: 200 })
  } catch (err) {
    console.error("Server account deletion failed:", err)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}