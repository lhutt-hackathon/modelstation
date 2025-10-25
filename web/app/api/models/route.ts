import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all models for this user
    const models = await prisma.model.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON strings back to arrays
    const modelsWithParsedData = models.map((model) => ({
      ...model,
      metrics: JSON.parse(model.metrics) as string[],
      highlights: JSON.parse(model.highlights) as string[],
    }));

    return NextResponse.json({ models: modelsWithParsedData });
  } catch (error) {
    console.error("Get models error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, domain, baseModel, dataset } = await request.json();

    if (!name || !domain || !baseModel || !dataset) {
      return NextResponse.json(
        { error: "Name, domain, baseModel, and dataset are required" },
        { status: 400 }
      );
    }

    // Create model
    const model = await prisma.model.create({
      data: {
        name,
        domain,
        baseModel,
        dataset,
        status: "training",
        lastTrained: new Date().toISOString(),
        userId: user.id,
      },
    });

    // Parse JSON strings back to arrays
    const modelWithParsedData = {
      ...model,
      metrics: JSON.parse(model.metrics) as string[],
      highlights: JSON.parse(model.highlights) as string[],
    };

    return NextResponse.json({ model: modelWithParsedData }, { status: 201 });
  } catch (error) {
    console.error("Create model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
