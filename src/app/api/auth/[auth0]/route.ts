import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ auth0: string }> }
) => {
    console.log("Auth0 Route Handler Triggered");

    try {
        const { auth0: route } = await params;
        console.log(`Requested route: ${route}`);

        // Check Env Vars
        const requiredVars = ['AUTH0_SECRET', 'AUTH0_ISSUER_BASE_URL', 'AUTH0_CLIENT_ID', 'APP_BASE_URL'];
        const missingVars = requiredVars.filter(key => !process.env[key]);

        if (missingVars.length > 0) {
            console.error("Missing Auth0 Environment Variables:", missingVars);
            return NextResponse.json({ error: "Missing Environment Variables", missing: missingVars }, { status: 500 });
        }

        if (route === 'login') {
            console.log("Starting interactive login...");
            const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "") || "";
            const redirectUri = `${baseUrl}/api/auth/callback`;
            console.log(`Generated redirect_uri: ${redirectUri}`);

            try {
                return await auth0.startInteractiveLogin({
                    returnTo: '/dashboard', // Redirect to dashboard after login
                    authorizationParameters: {
                        redirect_uri: redirectUri
                    }
                });
            } catch (loginError: any) {
                console.error("Login Error:", loginError);
                return NextResponse.json({ error: "Login Failed", details: loginError.message }, { status: 500 });
            }
        }

        if (route === 'logout') {
            console.log("Handling logout...");
            const returnTo = process.env.APP_BASE_URL || 'http://localhost:3000';
            const logoutUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}`;
            return NextResponse.redirect(logoutUrl);
        }

        if (route === 'callback') {
            console.log("Handling callback...");
            try {
                // @ts-ignore - authClient is private but accessible
                return await auth0.authClient.handleCallback(req, {
                    redirectUri: `${process.env.APP_BASE_URL?.replace(/\/$/, "")}/api/auth/callback`
                });
            } catch (callbackError: any) {
                console.error("Callback Error:", callbackError);
                return NextResponse.json({ error: "Callback Failed", details: callbackError.message }, { status: 500 });
            }
        }

        if (route === 'me') {
            console.log("Handling me (profile)...");
            try {
                const session = await auth0.getSession(req);
                if (!session) {
                    return NextResponse.json({}, { status: 204 });
                }
                return NextResponse.json(session.user);
            } catch (profileError: any) {
                console.error("Profile Error:", profileError);
                return NextResponse.json({ error: "Profile Failed", details: profileError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Route not found" }, { status: 404 });

    } catch (error: any) {
        console.error("Auth0 Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
};
