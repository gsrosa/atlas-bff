import { TRPCError } from "@trpc/server";
import { z } from "zod";

import * as creditsService from "@/services/credits.service";

import { protectedProcedure, router } from "../router.js";

const addFundsInputSchema = z.object({
  amount: z.number().int().positive().max(1_000_000),
  reason: z.string().min(1).max(200).optional(),
});

export const creditsRouter = router({
  balance: protectedProcedure.query(async ({ ctx }) => {
    return creditsService.getBalance(ctx.env, ctx.accessToken!, ctx.user!.id);
  }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().max(200).optional().default(50) }))
    .query(async ({ ctx, input }) => {
      return creditsService.listTransactions(ctx.env, ctx.accessToken!, ctx.user!.id, input.limit);
    }),

  addFunds: protectedProcedure.input(addFundsInputSchema).mutation(async ({ ctx, input }) => {
    if (!ctx.env.CREDITS_ALLOW_SELF_TOPUP) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Credit top-up is disabled. Use a payment integration or enable CREDITS_ALLOW_SELF_TOPUP in development.",
      });
    }
    return creditsService.addFundsForUser(ctx.env, ctx.user!.id, input.amount, input.reason ?? "manual_topup", {
      source: "bff_self_topup",
    });
  }),
});
