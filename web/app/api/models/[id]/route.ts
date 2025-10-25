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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const model = await prisma.model.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    // Parse JSON strings back to arrays
    const modelWithParsedData = {
      ...model,
      metrics: JSON.parse(model.metrics),
      highlights: JSON.parse(model.highlights),
    };

    return NextResponse.json({ model: modelWithParsedData });
  } catch (error) {
    console.error("Get model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify ownership before deleting
    const model = await prisma.model.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    await prisma.model.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Model deleted successfully" });
  } catch (error) {
    console.error("Delete model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify ownership
    const existingModel = await prisma.model.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Convert arrays to JSON strings if provided
    const updateData: any = { ...data };
    if (data.metrics) {
      updateData.metrics = JSON.stringify(data.metrics);
    }
    if (data.highlights) {
      updateData.highlights = JSON.stringify(data.highlights);
    }

    const model = await prisma.model.update({
      where: { id },
      data: updateData,
    });

    // Parse JSON strings back to arrays
    const modelWithParsedData = {
      ...model,
      metrics: JSON.parse(model.metrics),
      highlights: JSON.parse(model.highlights),
    };

    return NextResponse.json({ model: modelWithParsedData });
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
