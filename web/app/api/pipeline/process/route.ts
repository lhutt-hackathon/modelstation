import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/service-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiBaseUrl = getApiBaseUrl();
    const token = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = token;
    }

    const response = await fetch(`${apiBaseUrl}/pipeline/process`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || "Failed to process request" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pipeline process error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
