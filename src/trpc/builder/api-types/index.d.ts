import * as zod from 'zod';
import { z } from 'zod';
import * as _supabase_supabase_js from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import * as _trpc_server from '@trpc/server';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

/** Full structured output stored in trip_plans.itinerary (validated at API boundary). */
declare const tripItineraryDocumentSchema: z.ZodObject<{
    destination: z.ZodString;
    country: z.ZodString;
    bestTravelMonth: z.ZodOptional<z.ZodString>;
    weather: z.ZodOptional<z.ZodObject<{
        bestMonth: z.ZodString;
        summary: z.ZodString;
        temperatureRangeCelsius: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        bestMonth: string;
        temperatureRangeCelsius: string;
    }, {
        summary: string;
        bestMonth: string;
        temperatureRangeCelsius: string;
    }>>;
    days: z.ZodArray<z.ZodObject<{
        dayNumber: z.ZodNumber;
        dayTitle: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        summary: z.ZodOptional<z.ZodString>;
        attractions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            address: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
            price: z.ZodOptional<z.ZodObject<{
                amount: z.ZodNumber;
                currency: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                amount: number;
                currency: string;
            }, {
                amount: number;
                currency?: string | undefined;
            }>>;
            /** Typical visit duration in minutes (AI estimate). */
            averageMinutesSpent: z.ZodOptional<z.ZodNumber>;
            openingHours: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency: string;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }, {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency?: string | undefined;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }>, "many">>;
        meals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["breakfast", "lunch", "dinner", "snack"]>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }, {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }>, "many">>;
        transportation: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            mode: z.ZodString;
            durationMinutes: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }, {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }>, "many">>;
        lodging: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayNumber: number;
        city: string;
        attractions: {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency: string;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[];
        country?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        summary?: string | undefined;
        meals?: {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }[] | undefined;
        transportation?: {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }[] | undefined;
        lodging?: string | undefined;
    }, {
        dayNumber: number;
        city: string;
        country?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        summary?: string | undefined;
        attractions?: {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency?: string | undefined;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[] | undefined;
        meals?: {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }[] | undefined;
        transportation?: {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }[] | undefined;
        lodging?: string | undefined;
    }>, "many">;
    paidAttractions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodString;
        estimatedPriceUsd: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: string;
        estimatedPriceUsd: string;
        notes?: string | undefined;
    }, {
        name: string;
        category: string;
        estimatedPriceUsd: string;
        notes?: string | undefined;
    }>, "many">>;
    /** Extra AI fields (links, maps, disclaimers) without schema churn. */
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    country: string;
    destination: string;
    days: {
        dayNumber: number;
        city: string;
        attractions: {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency: string;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[];
        country?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        summary?: string | undefined;
        meals?: {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }[] | undefined;
        transportation?: {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }[] | undefined;
        lodging?: string | undefined;
    }[];
    meta?: Record<string, unknown> | undefined;
    bestTravelMonth?: string | undefined;
    weather?: {
        summary: string;
        bestMonth: string;
        temperatureRangeCelsius: string;
    } | undefined;
    paidAttractions?: {
        name: string;
        category: string;
        estimatedPriceUsd: string;
        notes?: string | undefined;
    }[] | undefined;
}, {
    country: string;
    destination: string;
    days: {
        dayNumber: number;
        city: string;
        country?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        summary?: string | undefined;
        attractions?: {
            name: string;
            address?: string | undefined;
            category?: string | undefined;
            notes?: string | undefined;
            price?: {
                amount: number;
                currency?: string | undefined;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[] | undefined;
        meals?: {
            type: "breakfast" | "lunch" | "dinner" | "snack";
            name: string;
            notes?: string | undefined;
        }[] | undefined;
        transportation?: {
            from: string;
            to: string;
            mode: string;
            notes?: string | undefined;
            durationMinutes?: number | undefined;
        }[] | undefined;
        lodging?: string | undefined;
    }[];
    meta?: Record<string, unknown> | undefined;
    bestTravelMonth?: string | undefined;
    weather?: {
        summary: string;
        bestMonth: string;
        temperatureRangeCelsius: string;
    } | undefined;
    paidAttractions?: {
        name: string;
        category: string;
        estimatedPriceUsd: string;
        notes?: string | undefined;
    }[] | undefined;
}>;
type TripItineraryDocument = z.infer<typeof tripItineraryDocumentSchema>;

/** Wizard + AI answers snapshot (matches atlas-ai-assistant form state). */
type TripFormSnapshot = {
    baseAnswers?: Record<string, string | string[]>;
    aiQuestions?: unknown[];
    aiAnswers?: Record<string, string | string[]>;
    [key: string]: unknown;
};
type TripPlanDTO = {
    id: string;
    user_id: string;
    title: string | null;
    ai_suggested_title: string | null;
    departure_at: string | null;
    arrival_at: string | null;
    flight_numbers: string[];
    days_count: number | null;
    destination: string | null;
    destination_country: string | null;
    form_snapshot: TripFormSnapshot;
    itinerary: TripItineraryDocument | Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

type CreditTransactionDTO = {
    id: string;
    user_id: string;
    amount: number;
    balance_after: number;
    reason: string;
    reference_type: string | null;
    reference_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
};

type ProfileDTO = {
    id: string;
    email: string | null;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    phone: string | null;
    bio: string | null;
    country: string | null;
    avatar_url: string | null;
    preferred_locale: string | null;
    credits_balance: number;
    created_at: string;
    updated_at: string;
};

declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodString;
    CORS_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
    /** Empty string in `.env` is treated as unset (POST /plans/stream will fail until set). */
    GEMINI_API_KEY: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    GEMINI_MODEL: z.ZodDefault<z.ZodString>;
    CREDITS_TRIP_PLAN_COST: z.ZodDefault<z.ZodNumber>;
    CREDITS_ALLOW_SELF_TOPUP: z.ZodDefault<z.ZodEffects<z.ZodBoolean, boolean, unknown>>;
    /** Optional: direct Postgres (`postgres` package). Required only if you import `@/db`. */
    DATABASE_URL: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    /** Redis for opaque server-side sessions (httpOnly cookie). Required for cookie-based auth. */
    REDIS_URL: z.ZodString;
    /** Cookie name for the opaque session id (default atlas_session). */
    SESSION_COOKIE_NAME: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    CORS_ORIGINS: string[];
    GEMINI_MODEL: string;
    CREDITS_TRIP_PLAN_COST: number;
    CREDITS_ALLOW_SELF_TOPUP: boolean;
    REDIS_URL: string;
    SESSION_COOKIE_NAME: string;
    GEMINI_API_KEY?: string | undefined;
    DATABASE_URL?: string | undefined;
}, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    REDIS_URL: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    CORS_ORIGINS?: string | undefined;
    GEMINI_API_KEY?: unknown;
    GEMINI_MODEL?: string | undefined;
    CREDITS_TRIP_PLAN_COST?: number | undefined;
    CREDITS_ALLOW_SELF_TOPUP?: unknown;
    DATABASE_URL?: unknown;
    SESSION_COOKIE_NAME?: string | undefined;
}>;
type Env = z.infer<typeof envSchema>;

type Context = {
    env: Env;
    req: CreateExpressContextOptions["req"];
    res: CreateExpressContextOptions["res"];
    accessToken?: string;
    user?: User;
    /** Present when auth came from the httpOnly session cookie (used by signOut). */
    sessionId?: string;
};

declare const appRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: {
        data: {
            zodError: zod.typeToFlattenedError<any, string> | null;
            code: _trpc_server.TRPC_ERROR_CODE_KEY;
            httpStatus: number;
            path?: string;
            stack?: string;
        };
        message: string;
        code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    auth: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: {
            data: {
                zodError: zod.typeToFlattenedError<any, string> | null;
                code: _trpc_server.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        signUp: _trpc_server.TRPCMutationProcedure<{
            input: {
                gender: "male" | "female" | "other" | "prefer_not_to_say";
                country: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phone?: string | undefined;
                bio?: string | undefined;
            };
            output: {
                user: _supabase_supabase_js.AuthUser;
                needsEmailConfirmation: boolean;
                resumedAsSignIn: true;
            } | {
                user: _supabase_supabase_js.AuthUser | null;
                needsEmailConfirmation: boolean;
                resumedAsSignIn?: undefined;
            };
            meta: object;
        }>;
        signIn: _trpc_server.TRPCMutationProcedure<{
            input: {
                email: string;
                password: string;
            };
            output: {
                user: _supabase_supabase_js.AuthUser;
            };
            meta: object;
        }>;
        signOut: _trpc_server.TRPCMutationProcedure<{
            input: void;
            output: {
                ok: true;
            };
            meta: object;
        }>;
        refresh: _trpc_server.TRPCMutationProcedure<{
            input: {
                refresh_token: string;
            };
            output: {
                user: _supabase_supabase_js.AuthUser | null;
                session: _supabase_supabase_js.AuthSession;
            };
            meta: object;
        }>;
        changePassword: _trpc_server.TRPCMutationProcedure<{
            input: {
                currentPassword: string;
                newPassword: string;
            };
            output: {
                ok: true;
            };
            meta: object;
        }>;
    }>>;
    users: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: {
            data: {
                zodError: zod.typeToFlattenedError<any, string> | null;
                code: _trpc_server.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        me: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: {
                profile: ProfileDTO | null;
            };
            meta: object;
        }>;
        updateMe: _trpc_server.TRPCMutationProcedure<{
            input: {
                display_name?: string | undefined;
                first_name?: string | undefined;
                last_name?: string | undefined;
                gender?: "male" | "female" | "other" | "prefer_not_to_say" | undefined;
                phone?: string | undefined;
                bio?: string | undefined;
                country?: string | undefined;
                avatar_url?: string | undefined;
                preferred_locale?: "en-US" | "pt-BR" | "es-ES" | null | undefined;
            };
            output: {
                profile: ProfileDTO;
            };
            meta: object;
        }>;
    }>>;
    credits: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: {
            data: {
                zodError: zod.typeToFlattenedError<any, string> | null;
                code: _trpc_server.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        balance: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: {
                balance: number;
            };
            meta: object;
        }>;
        list: _trpc_server.TRPCQueryProcedure<{
            input: {
                page?: number | undefined;
                limit?: number | undefined;
            };
            output: {
                transactions: CreditTransactionDTO[];
                total: number;
                page: number;
                limit: number;
            };
            meta: object;
        }>;
        addFunds: _trpc_server.TRPCMutationProcedure<{
            input: {
                amount: number;
                reason?: string | undefined;
            };
            output: {
                balance: number;
            };
            meta: object;
        }>;
    }>>;
    plans: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: {
            data: {
                zodError: zod.typeToFlattenedError<any, string> | null;
                code: _trpc_server.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        list: _trpc_server.TRPCQueryProcedure<{
            input: {
                page?: number | undefined;
                limit?: number | undefined;
            };
            output: {
                plans: TripPlanDTO[];
                total: number;
                page: number;
                limit: number;
            };
            meta: object;
        }>;
        create: _trpc_server.TRPCMutationProcedure<{
            input: {
                destination?: string | undefined;
                title?: string | undefined;
                aiSuggestedTitle?: string | undefined;
                departureAt?: string | undefined;
                arrivalAt?: string | undefined;
                flightNumbers?: string[] | undefined;
                flights?: {
                    flightNumber: string;
                    departureDate?: string | undefined;
                    arrivalDate?: string | undefined;
                }[] | undefined;
                daysCount?: number | undefined;
                destinationCountry?: string | undefined;
                formSnapshot?: Record<string, unknown> | undefined;
                itinerary?: Record<string, unknown> | undefined;
            };
            output: {
                plan: TripPlanDTO;
            };
            meta: object;
        }>;
        getById: _trpc_server.TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: {
                plan: TripPlanDTO;
            };
            meta: object;
        }>;
        update: _trpc_server.TRPCMutationProcedure<{
            input: {
                id: string;
                destination?: string | undefined;
                title?: string | undefined;
                aiSuggestedTitle?: string | undefined;
                departureAt?: string | undefined;
                arrivalAt?: string | undefined;
                flightNumbers?: string[] | undefined;
                flights?: {
                    flightNumber: string;
                    departureDate?: string | undefined;
                    arrivalDate?: string | undefined;
                }[] | undefined;
                daysCount?: number | undefined;
                destinationCountry?: string | undefined;
                formSnapshot?: Record<string, unknown> | undefined;
                itinerary?: Record<string, unknown> | undefined;
            };
            output: {
                plan: TripPlanDTO;
            };
            meta: object;
        }>;
        delete: _trpc_server.TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                ok: true;
            };
            meta: object;
        }>;
    }>>;
    travelerProfile: _trpc_server.TRPCBuiltRouter<{
        ctx: Context;
        meta: object;
        errorShape: {
            data: {
                zodError: zod.typeToFlattenedError<any, string> | null;
                code: _trpc_server.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: true;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        get: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: {
                preferences: Record<string, unknown>;
                tier1Complete: boolean;
            };
            meta: object;
        }>;
        patch: _trpc_server.TRPCMutationProcedure<{
            input: {
                diet?: "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "flexitarian" | "halal" | "kosher" | undefined;
                foodAdventurousness?: 3 | 1 | 2 | 4 | 5 | undefined;
                foodImportance?: 3 | 1 | 2 | 4 | 5 | undefined;
                restaurantStyles?: string[] | undefined;
                drinksAlcohol?: boolean | undefined;
                foodAllergies?: string | null | undefined;
                urbanVsNature?: 3 | 1 | 2 | 4 | 5 | undefined;
                landscapeTypes?: string[] | undefined;
                climateTolerance?: "heat" | "mild" | "cold" | "any" | undefined;
                altitudeSensitive?: boolean | undefined;
                stimulationPreference?: 3 | 1 | 2 | 4 | 5 | undefined;
                discoveryStyle?: "researcher" | "loose-planner" | "wanderer" | undefined;
                depthVsBreadth?: 3 | 1 | 2 | 4 | 5 | undefined;
                crowdTolerance?: "fine" | "mixed" | "avoids" | undefined;
                localInteraction?: "loves-it" | "sometimes" | "observer" | undefined;
                travelPersonality?: "introvert" | "extrovert" | "balanced" | undefined;
                interests?: string[] | undefined;
                photographyImportance?: 3 | 1 | 2 | 4 | 5 | undefined;
                budgetStyle?: "value" | "budget" | "comfort" | "luxury" | undefined;
                accommodationStyles?: ("luxury" | "hostel" | "budget-hotel" | "mid-hotel" | "boutique" | "airbnb" | "camping")[] | undefined;
                accommodationMustHaves?: string[] | undefined;
                ecoConsciousness?: "priority" | "when-convenient" | "not-a-factor" | undefined;
                ethicalLimits?: string[] | undefined;
                fitnessLevel?: "sedentary" | "active" | "athletic" | undefined;
                connectivityNeeds?: "balanced" | "always-connected" | "disconnects" | undefined;
                languageComfort?: "english-only" | "gestures-ok" | "adventurous" | "multilingual" | undefined;
                wellnessImportance?: 3 | 1 | 2 | 4 | 5 | undefined;
                tripMemorableBy?: "transcendent-experience" | "consistent-quality" | "unexpected-discoveries" | "food-drink" | "human-connections" | "being-lost-in-place" | undefined;
            };
            output: {
                preferences: Record<string, unknown>;
                tier1Complete: boolean;
            };
            meta: object;
        }>;
    }>>;
}>>;
type AppRouter = typeof appRouter;
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type { AppRouter, RouterInputs, RouterOutputs };
