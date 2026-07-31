export async function GET(): Promise<Response> {
  return Response.json({ ok: true, service: "dr-akin-platform-api" });
}
