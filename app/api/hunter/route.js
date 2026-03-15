export async function POST(request) {
  try {
    const { first_name, last_name, company, domain } = await request.json();

    if (!process.env.HUNTER_API_KEY) {
      return Response.json(
        { success: false, error: "HUNTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      first_name: first_name || "",
      last_name: last_name || "",
      api_key: process.env.HUNTER_API_KEY,
    });

    if (domain) {
      params.set("domain", domain);
    } else if (company) {
      params.set("company", company);
    }

    const response = await fetch(
      `https://api.hunter.io/v2/email-finder?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || data.errors) {
      return Response.json(
        { success: false, error: data.errors?.[0]?.details || "Not found" },
        { status: 200 }
      );
    }

    const email = data.data?.email;
    const confidence = data.data?.score || 0;

    if (!email) {
      return Response.json({ success: false, error: "No email found" });
    }

    return Response.json({ success: true, email, confidence });
  } catch (error) {
    console.error("Hunter error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
