# atlas-bff

Backend-for-frontend. Express server exposing tRPC + a few plain HTTP routes. Auth via Supabase.

## Dev
```bash
pnpm dev          # tsx watch, hot-reload
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm db:migrate   # apply SQL migrations via Supabase
pnpm api:smoke    # smoke test live endpoints
```

## Architecture
```
src/
├── app.ts                  # Express app factory (receives Env)
├── index.ts                # Entry: loads env, creates app, listens
├── env/env.ts              # Zod-validated env schema
├── trpc/
│   ├── routes/_app.ts      # Root router: auth, users, credits, plans
│   ├── router.ts           # router + protectedProcedure
│   ├── context.ts          # Context type (env, req, res, user, accessToken)
│   └── middlewares/auth.middleware.ts
├── services/               # Business logic (pure functions receiving env + accessToken)
├── shared/
│   ├── dtos/               # Response shape types
│   └── validation-schema/  # Zod schemas for tRPC inputs
└── http/                   # Plain Express routers (streaming, /me)
```

## tRPC Patterns
```ts
// Protected procedure — requires valid Supabase session
export const plansRouter = router({
  list: protectedProcedure.input(listTripPlansInputSchema).query(async ({ ctx, input }) => {
    return tripPlansService.listTripPlans(ctx.env, ctx.accessToken!, input.limit);
  }),
});
```

- Services receive `(env, accessToken, ...)` — no global state
- Zod schemas live in `shared/validation-schema/`, reused for input + DTOs
- Auth middleware sets `ctx.user` and `ctx.accessToken` from cookie or Bearer header

## Auth
- httpOnly session cookie (primary) OR `Authorization: Bearer <token>`
- `require-bearer-auth` Express middleware sets `req.atlasUser` + `req.atlasAccessToken`
- `protectedProcedure` tRPC middleware reads from ctx, throws `UNAUTHORIZED` if missing

## DB
- Postgres via `postgres` package, accessed through Supabase REST or direct SQL
- Migrations in `scripts/`, applied via `pnpm db:migrate`
- Redis (ioredis) for caching/rate limiting

## AI Engineering Infrastructure (.ai/)

See `.ai/README.md` for the full overview. Key sections:

### Rules — read before writing any code
- `.ai/rules/core.md` — non-negotiable rules (imports, naming, YAGNI)
- `.ai/rules/naming.md` — naming conventions
- `.ai/rules/structure.md` — folder structure rules
- `.ai/rules/testing.md` — testing conventions

### Architecture Decisions — read when touching affected areas
- `.ai/decisions/index.md` — table of all ADRs
- `.ai/decisions/004-bff-ai-orchestration.md` — BFF as AI orchestration layer
- `.ai/decisions/002-global-state.md` — Trip state ownership

### Active Context — read when continuing an in-progress feature
- `.ai/context/current.md` — last session state, next steps, open decisions
