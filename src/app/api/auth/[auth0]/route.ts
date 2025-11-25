import { AuthClient } from "@auth0/nextjs-auth0/server";

const client = new AuthClient({} as any);

export const GET = (req: any, ctx: any) => client.handler(req);
export const POST = (req: any, ctx: any) => client.handler(req);
