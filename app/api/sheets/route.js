export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scriptUrl = searchParams.get("scriptUrl");
    const action = searchParams.get("action");

    if (!scriptUrl) {
      return Response.json(
        { success: false, error: "scriptUrl parameter required" },
        { status: 400 }
      );
    }

    // Build the URL with all parameters
    const params = new URLSearchParams();
    params.set("action", action || "getLeads");

    // Pass through pagination params if present
    if (searchParams.has("offset")) {
      params.set("offset", searchParams.get("offset"));
    }
    if (searchParams.has("limit")) {
      params.set("limit", searchParams.get("limit"));
    }

    const targetUrl = `${scriptUrl}?${params.toString()}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: `Google Apps Script error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { scriptUrl, ...payload } = await request.json();

    if (!scriptUrl) {
      return Response.json(
        { success: false, error: "scriptUrl required in body" },
        { status: 400 }
      );
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: `Google Apps Script error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
