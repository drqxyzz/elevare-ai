import { AuthClient } from "@auth0/nextjs-auth0/server";

const client = new AuthClient({} as any);

export const GET = client.handler;
export const POST = client.handler;
