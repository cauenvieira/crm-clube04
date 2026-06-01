import type { TestRunContext } from "./test-run.js";
import { createTestPhone } from "./test-run.js";

export function buildTestTutorName(ctx: TestRunContext, suffix: string) {
  return `${ctx.namePrefix}_${suffix}`;
}

export function buildTestPhone(ctx: TestRunContext, index: number) {
  return createTestPhone(ctx.runId, index);
}

export function buildTestNote(ctx: TestRunContext, suffix: string) {
  return `${ctx.noteMarker} | ${suffix}`;
}

export function buildRunPayloadSource(ctx: TestRunContext) {
  return ctx.sourceMarker;
}
