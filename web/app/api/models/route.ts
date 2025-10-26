import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/service-client";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const apiResponse = await fetch(`${getApiBaseUrl()}/models`, {
      method: "GET",
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
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
    const payload = await request.json();

    const apiResponse = await fetch(`${getApiBaseUrl()}/models`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (error) {
    console.error("Create model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
