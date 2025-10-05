import { NextRequest, NextResponse } from "next/server";

// Proxy endpoint for a single organization resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const response = await fetch(
      `${backendUrl}/api/organizations/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    // Pass through non-OK responses as-is (text or json)
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        return NextResponse.json(json, { status: response.status });
      }
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error (organization by id):", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
