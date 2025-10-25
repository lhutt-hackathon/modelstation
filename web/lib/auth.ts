import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }
      return null;
    }

    const { password: _, ...userWithoutPassword } = session.user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
