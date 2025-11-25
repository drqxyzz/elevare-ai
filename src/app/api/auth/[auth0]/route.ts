import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ auth0: string }> }
) => {
    const { auth0: route } = await params;

    if (route === 'login') {
        return auth0.startInteractiveLogin({});
    }

    if (route === 'logout') {
        // Basic logout redirect if no method exists
        const returnTo = new URL('/', req.url).toString();
        const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;
        return NextResponse.redirect(logoutUrl);
    }

    // Callback is likely handled by middleware, but if not:
    // We might need to handle it here.

    return new Response(`Route ${route} not found`, { status: 404 });
};
