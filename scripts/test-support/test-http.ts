import type { HttpResult } from "../smoke/smoke-api-helpers.js";
import { request } from "../smoke/smoke-api-helpers.js";

import type { TestRunContext } from "./test-run.js";

export async function testRequest(
  ctx: Pick<TestRunContext, "apiBaseUrl" | "apiSecret">,
  method: string,
  path: string,
  body?: unknown
): Promise<HttpResult> {
  return await request(ctx.apiBaseUrl, ctx.apiSecret, method, path, {
    body
  });
}
