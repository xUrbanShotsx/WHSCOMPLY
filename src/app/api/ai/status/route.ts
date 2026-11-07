export function GET() {
  return Response.json({
    configured: !!(
      process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    ),
  });
}
