export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  try {
    // For Vercel Node functions in older runtime, body may not be parsed automatically:
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const token = body.token;

    const real = process.env.ADMIN_TOKEN;

    if (!real) {
      return res
        .status(500)
        .json({ ok: false, error: "Server misconfigured (no ADMIN_TOKEN)" });
    }

    if (!token) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing token" });
    }

    if (token === real) {
      return res.status(200).json({ ok: true });
    }

    return res
      .status(401)
      .json({ ok: false, error: "Invalid admin token" });

  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ ok: false, error: "Bad request" });
  }
}
