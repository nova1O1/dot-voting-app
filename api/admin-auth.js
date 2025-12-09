export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Body may be string or already parsed:
    let body = req.body || {};
    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const token = body.token;

    // Fallback to "admin123" locally if env not set:
    const real = process.env.ADMIN_TOKEN || "admin123";

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
    console.error("admin-auth error", err);
    return res
      .status(400)
      .json({ ok: false, error: "Bad request" });
  }
}
