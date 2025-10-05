import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

        const response = await fetch(`${backendUrl}/api/inventory/sales-stats`, {
            method: "GET",
            headers: {
                Cookie: request.headers.get("cookie") || "",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const text = await response.text();
            return new NextResponse(text, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch sales statistics" },
            { status: 500 }
        );
    }
}