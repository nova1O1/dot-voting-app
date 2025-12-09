export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json({ ok: false, error: "Missing token" }, { status: 400 });
    }

    const realToken = process.env.ADMIN_TOKEN;

    if (!realToken) {
      return Response.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
    }

    if (token === realToken) {
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });

  } catch (e) {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
