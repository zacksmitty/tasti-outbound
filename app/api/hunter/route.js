export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const firstName = searchParams.get("first_name");
    const lastName = searchParams.get("last_name");

    if (!domain) {
      return Response.json(
        { success: false, error: "Domain parameter required" },
        { status: 400 }
      );
    }

    if (!process.env.HUNTER_API_KEY) {
      return Response.json(
        { success: false, error: "HUNTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      domain,
      domain_only: "true",
      limit: "10",
    });

    if (firstName) params.append("first_name", firstName);
    if (lastName) params.append("last_name", lastName);

    const response = await fetch(
      `https://api.hunter.io/v2/email-finder?${params.toString()}&email_type=personal`,
      {
        headers: {
          "X-API-Key": process.env.HUNTER_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Hunter API error:", error);
      return Response.json(
        { success: false, error: "Failed to find email" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      data: {
        email: data.data?.email || null,
        confidence: data.data?.confidence || "unknown",
        sources: data.data?.sources || [],
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
