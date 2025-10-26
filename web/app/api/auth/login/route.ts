import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/service-client";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const apiResponse = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
