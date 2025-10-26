import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/service-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const { id } = await params;

    const apiResponse = await fetch(`${getApiBaseUrl()}/models/${id}`, {
      method: "GET",
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
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
    const { id } = await params;

    const apiResponse = await fetch(`${getApiBaseUrl()}/models/${id}`, {
      method: "DELETE",
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
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
    const { id } = await params;

    const body = await request.json();

    const apiResponse = await fetch(`${getApiBaseUrl()}/models/${id}`, {
      method: "PATCH",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
