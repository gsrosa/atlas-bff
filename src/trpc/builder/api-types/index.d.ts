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
        slots: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            dayNumber: z.ZodNumber;
            startTime: z.ZodString;
            endTime: z.ZodOptional<z.ZodString>;
            durationMinutes: z.ZodOptional<z.ZodNumber>;
            kind: z.ZodEnum<["attraction", "meal", "transport", "activity", "lodging", "free_time"]>;
            title: z.ZodString;
            notes: z.ZodOptional<z.ZodString>;
            area: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            country: z.ZodOptional<z.ZodString>;
            estimatedPrice: z.ZodOptional<z.ZodObject<{
                amount: z.ZodOptional<z.ZodNumber>;
                min: z.ZodOptional<z.ZodNumber>;
                max: z.ZodOptional<z.ZodNumber>;
                currency: z.ZodString;
                label: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            }, {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            }>>;
            resolve: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<["restaurant", "attraction", "lodging", "activity_provider"]>;
                priority: z.ZodEnum<["required", "nice_to_have"]>;
                query: z.ZodString;
                slot: z.ZodOptional<z.ZodEnum<["breakfast", "lunch", "dinner", "snack"]>>;
                city: z.ZodString;
                country: z.ZodOptional<z.ZodString>;
                area: z.ZodOptional<z.ZodString>;
                nearSlotId: z.ZodOptional<z.ZodString>;
                nearText: z.ZodOptional<z.ZodString>;
                cuisineHints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                budgetHint: z.ZodOptional<z.ZodEnum<["budget", "moderate", "comfort", "luxury"]>>;
                allowUnresolved: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            }, {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            }>>;
            resolvedPlace: z.ZodOptional<z.ZodObject<{
                source: z.ZodLiteral<"google_places">;
                placeId: z.ZodString;
                name: z.ZodString;
                address: z.ZodOptional<z.ZodString>;
                rating: z.ZodOptional<z.ZodNumber>;
                userRatingsTotal: z.ZodOptional<z.ZodNumber>;
                priceLevel: z.ZodOptional<z.ZodNumber>;
                location: z.ZodOptional<z.ZodObject<{
                    lat: z.ZodNumber;
                    lng: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    lat: number;
                    lng: number;
                }, {
                    lat: number;
                    lng: number;
                }>>;
                mapsUrl: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            }, {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            }>>;
            routeFromPrevious: z.ZodOptional<z.ZodObject<{
                fromSlotId: z.ZodString;
                toSlotId: z.ZodString;
                modes: z.ZodObject<{
                    walking: z.ZodOptional<z.ZodObject<{
                        durationMinutes: z.ZodNumber;
                        distanceMeters: z.ZodOptional<z.ZodNumber>;
                        mapsUrl: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }>>;
                    driving: z.ZodOptional<z.ZodObject<{
                        durationMinutes: z.ZodNumber;
                        distanceMeters: z.ZodOptional<z.ZodNumber>;
                        mapsUrl: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }>>;
                    transit: z.ZodOptional<z.ZodObject<{
                        durationMinutes: z.ZodNumber;
                        distanceMeters: z.ZodOptional<z.ZodNumber>;
                        mapsUrl: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }, {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                }, {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                }>;
                recommendedMode: z.ZodOptional<z.ZodEnum<["walking", "driving", "transit"]>>;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            }, {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }, {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }>, "many">>;
        mapRoute: z.ZodOptional<z.ZodObject<{
            dayNumber: z.ZodNumber;
            mapsUrl: z.ZodString;
            placeIds: z.ZodArray<z.ZodString, "many">;
            unresolvedStopTitles: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        }, {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        }>>;
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
            averageMinutesSpent: z.ZodOptional<z.ZodNumber>;
            openingHours: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            address?: string | undefined;
            notes?: string | undefined;
            category?: string | undefined;
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
            notes?: string | undefined;
            category?: string | undefined;
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
        city: string;
        dayNumber: number;
        attractions: {
            name: string;
            address?: string | undefined;
            notes?: string | undefined;
            category?: string | undefined;
            price?: {
                amount: number;
                currency: string;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[];
        country?: string | undefined;
        lodging?: string | undefined;
        summary?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        slots?: {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }[] | undefined;
        mapRoute?: {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        } | undefined;
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
    }, {
        city: string;
        dayNumber: number;
        country?: string | undefined;
        lodging?: string | undefined;
        summary?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        slots?: {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }[] | undefined;
        mapRoute?: {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        } | undefined;
        attractions?: {
            name: string;
            address?: string | undefined;
            notes?: string | undefined;
            category?: string | undefined;
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
    tripAdvice: z.ZodOptional<z.ZodObject<{
        bestAreasToStay: z.ZodArray<z.ZodObject<{
            area: z.ZodString;
            reason: z.ZodString;
            bestFor: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }, {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }>, "many">;
        shouldSplitStay: z.ZodBoolean;
        splitStayAdvice: z.ZodOptional<z.ZodObject<{
            summary: z.ZodString;
            suggestedMoves: z.ZodArray<z.ZodObject<{
                fromDay: z.ZodNumber;
                toDay: z.ZodNumber;
                area: z.ZodString;
                reason: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }, {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        }, {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        }>>;
        transportAdvice: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        safetyOrLogisticsAdvice: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        bestAreasToStay: {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }[];
        shouldSplitStay: boolean;
        splitStayAdvice?: {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        } | undefined;
        transportAdvice?: string[] | undefined;
        safetyOrLogisticsAdvice?: string[] | undefined;
    }, {
        bestAreasToStay: {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }[];
        shouldSplitStay: boolean;
        splitStayAdvice?: {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        } | undefined;
        transportAdvice?: string[] | undefined;
        safetyOrLogisticsAdvice?: string[] | undefined;
    }>>;
    /** Extra AI fields (links, maps, disclaimers) without schema churn. */
    meta: z.ZodOptional<z.ZodObject<{
        placeResolveStats: z.ZodOptional<z.ZodObject<{
            requested: z.ZodOptional<z.ZodNumber>;
            resolved: z.ZodOptional<z.ZodNumber>;
            unresolved: z.ZodOptional<z.ZodNumber>;
            failed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }>>;
    }, "strip", z.ZodUnknown, z.objectOutputType<{
        placeResolveStats: z.ZodOptional<z.ZodObject<{
            requested: z.ZodOptional<z.ZodNumber>;
            resolved: z.ZodOptional<z.ZodNumber>;
            unresolved: z.ZodOptional<z.ZodNumber>;
            failed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }>>;
    }, z.ZodUnknown, "strip">, z.objectInputType<{
        placeResolveStats: z.ZodOptional<z.ZodObject<{
            requested: z.ZodOptional<z.ZodNumber>;
            resolved: z.ZodOptional<z.ZodNumber>;
            unresolved: z.ZodOptional<z.ZodNumber>;
            failed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }>>;
    }, z.ZodUnknown, "strip">>>;
}, "strip", z.ZodTypeAny, {
    country: string;
    destination: string;
    days: {
        city: string;
        dayNumber: number;
        attractions: {
            name: string;
            address?: string | undefined;
            notes?: string | undefined;
            category?: string | undefined;
            price?: {
                amount: number;
                currency: string;
            } | undefined;
            averageMinutesSpent?: number | undefined;
            openingHours?: string | undefined;
            websiteUrl?: string | undefined;
        }[];
        country?: string | undefined;
        lodging?: string | undefined;
        summary?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        slots?: {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }[] | undefined;
        mapRoute?: {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        } | undefined;
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
    }[];
    meta?: z.objectOutputType<{
        placeResolveStats: z.ZodOptional<z.ZodObject<{
            requested: z.ZodOptional<z.ZodNumber>;
            resolved: z.ZodOptional<z.ZodNumber>;
            unresolved: z.ZodOptional<z.ZodNumber>;
            failed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }>>;
    }, z.ZodUnknown, "strip"> | undefined;
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
    tripAdvice?: {
        bestAreasToStay: {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }[];
        shouldSplitStay: boolean;
        splitStayAdvice?: {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        } | undefined;
        transportAdvice?: string[] | undefined;
        safetyOrLogisticsAdvice?: string[] | undefined;
    } | undefined;
}, {
    country: string;
    destination: string;
    days: {
        city: string;
        dayNumber: number;
        country?: string | undefined;
        lodging?: string | undefined;
        summary?: string | undefined;
        dayTitle?: string | undefined;
        region?: string | undefined;
        slots?: {
            id: string;
            kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
            city: string;
            dayNumber: number;
            startTime: string;
            title: string;
            country?: string | undefined;
            notes?: string | undefined;
            area?: string | undefined;
            durationMinutes?: number | undefined;
            endTime?: string | undefined;
            estimatedPrice?: {
                currency: string;
                min?: number | undefined;
                max?: number | undefined;
                amount?: number | undefined;
                label?: string | undefined;
            } | undefined;
            resolve?: {
                query: string;
                kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                priority: "required" | "nice_to_have";
                city: string;
                allowUnresolved: boolean;
                country?: string | undefined;
                slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                area?: string | undefined;
                nearSlotId?: string | undefined;
                nearText?: string | undefined;
                cuisineHints?: string[] | undefined;
                budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
            } | undefined;
            resolvedPlace?: {
                name: string;
                source: "google_places";
                placeId: string;
                address?: string | undefined;
                rating?: number | undefined;
                userRatingsTotal?: number | undefined;
                priceLevel?: number | undefined;
                location?: {
                    lat: number;
                    lng: number;
                } | undefined;
                mapsUrl?: string | undefined;
            } | undefined;
            routeFromPrevious?: {
                fromSlotId: string;
                toSlotId: string;
                modes: {
                    walking?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    driving?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                    transit?: {
                        durationMinutes: number;
                        mapsUrl?: string | undefined;
                        distanceMeters?: number | undefined;
                    } | undefined;
                };
                notes?: string | undefined;
                recommendedMode?: "walking" | "driving" | "transit" | undefined;
            } | undefined;
        }[] | undefined;
        mapRoute?: {
            mapsUrl: string;
            dayNumber: number;
            placeIds: string[];
            unresolvedStopTitles: string[];
        } | undefined;
        attractions?: {
            name: string;
            address?: string | undefined;
            notes?: string | undefined;
            category?: string | undefined;
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
    }[];
    meta?: z.objectInputType<{
        placeResolveStats: z.ZodOptional<z.ZodObject<{
            requested: z.ZodOptional<z.ZodNumber>;
            resolved: z.ZodOptional<z.ZodNumber>;
            unresolved: z.ZodOptional<z.ZodNumber>;
            failed: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }, {
            requested?: number | undefined;
            resolved?: number | undefined;
            unresolved?: number | undefined;
            failed?: number | undefined;
        }>>;
    }, z.ZodUnknown, "strip"> | undefined;
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
    tripAdvice?: {
        bestAreasToStay: {
            reason: string;
            area: string;
            bestFor?: string[] | undefined;
        }[];
        shouldSplitStay: boolean;
        splitStayAdvice?: {
            summary: string;
            suggestedMoves: {
                reason: string;
                area: string;
                fromDay: number;
                toDay: number;
            }[];
        } | undefined;
        transportAdvice?: string[] | undefined;
        safetyOrLogisticsAdvice?: string[] | undefined;
    } | undefined;
}>;
type TripItineraryDocument = z.infer<typeof tripItineraryDocumentSchema>;

type TripFormSnapshot = {
    baseAnswers?: Record<string, string | string[]>;
    aiQuestions?: unknown[];
    aiAnswers?: Record<string, string | string[]>;
    [key: string]: unknown;
};
type TripPlanDTO = {
    id: string;
    userId: string;
    title: string | null;
    aiSuggestedTitle: string | null;
    departureAt: string | null;
    arrivalAt: string | null;
    flightNumbers: string[];
    daysCount: number | null;
    destination: string | null;
    destinationCountry: string | null;
    formSnapshot: TripFormSnapshot;
    itinerary: TripItineraryDocument | Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
};
type TripPlanResponseDTO = {
    plan: TripPlanDTO;
};
type TripPlansResponseDTO = {
    plans: TripPlanDTO[];
    total: number;
    page: number;
    limit: number;
};

type CreditTransactionDTO = {
    id: string;
    userId: string;
    amount: number;
    balanceAfter: number;
    reason: string;
    referenceType: string | null;
    referenceId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
};
type CreditTransactionsResponseDTO = {
    transactions: CreditTransactionDTO[];
    total: number;
    page: number;
    limit: number;
};

type ProfileDTO = {
    id: string;
    email: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    phone: string | null;
    bio: string | null;
    country: string | null;
    avatarUrl: string | null;
    preferredLocale: string | null;
    creditsBalance: number;
    createdAt: string;
    updatedAt: string;
};
type ProfileResponseDTO = {
    profile: ProfileDTO | null;
};

declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodString;
    CORS_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
    GEMINI_API_KEY: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    GEMINI_MODEL: z.ZodDefault<z.ZodString>;
    OPENAI_API_KEY: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    OPENAI_MODEL: z.ZodDefault<z.ZodString>;
    GOOGLE_PLACES_API_KEY: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    GOOGLE_DIRECTIONS_API_KEY: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    CREDITS_TRIP_PLAN_COST: z.ZodDefault<z.ZodNumber>;
    CREDITS_ALLOW_SELF_TOPUP: z.ZodDefault<z.ZodEffects<z.ZodBoolean, boolean, unknown>>;
    DATABASE_URL: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
    REDIS_URL: z.ZodString;
    SESSION_COOKIE_NAME: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    CORS_ORIGINS: string[];
    GEMINI_MODEL: string;
    OPENAI_MODEL: string;
    CREDITS_TRIP_PLAN_COST: number;
    CREDITS_ALLOW_SELF_TOPUP: boolean;
    REDIS_URL: string;
    SESSION_COOKIE_NAME: string;
    GEMINI_API_KEY?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    GOOGLE_PLACES_API_KEY?: string | undefined;
    GOOGLE_DIRECTIONS_API_KEY?: string | undefined;
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
    OPENAI_API_KEY?: unknown;
    OPENAI_MODEL?: string | undefined;
    GOOGLE_PLACES_API_KEY?: unknown;
    GOOGLE_DIRECTIONS_API_KEY?: unknown;
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
                email: string;
                password: string;
                gender: "male" | "female" | "other" | "prefer_not_to_say";
                country: string;
                firstName: string;
                lastName: string;
                phone?: string | undefined;
                bio?: string | undefined;
            };
            output: {
                user: _supabase_supabase_js.AuthUser | null;
                session: _supabase_supabase_js.AuthSession | null;
                needsEmailConfirmation: boolean;
                resumedAsSignIn: true;
            } | {
                user: _supabase_supabase_js.AuthUser | null;
                session: _supabase_supabase_js.AuthSession | null;
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
                user: _supabase_supabase_js.AuthUser | null;
                session: _supabase_supabase_js.AuthSession | null;
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
            output: ProfileResponseDTO;
            meta: object;
        }>;
        updateMe: _trpc_server.TRPCMutationProcedure<{
            input: {
                phone?: string | undefined;
                display_name?: string | undefined;
                first_name?: string | undefined;
                last_name?: string | undefined;
                gender?: "male" | "female" | "other" | "prefer_not_to_say" | undefined;
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
                limit?: number | undefined;
                page?: number | undefined;
            };
            output: CreditTransactionsResponseDTO;
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
                limit?: number | undefined;
                page?: number | undefined;
            };
            output: TripPlansResponseDTO;
            meta: object;
        }>;
        create: _trpc_server.TRPCMutationProcedure<{
            input: {
                title?: string | undefined;
                destination?: string | undefined;
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
            output: TripPlanResponseDTO;
            meta: object;
        }>;
        getById: _trpc_server.TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: TripPlanResponseDTO;
            meta: object;
        }>;
        update: _trpc_server.TRPCMutationProcedure<{
            input: {
                id: string;
                title?: string | undefined;
                destination?: string | undefined;
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
            output: TripPlanResponseDTO;
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
        generateChecklist: _trpc_server.TRPCMutationProcedure<{
            input: {
                answers: Record<string, string | string[]>;
                tripDetails?: {
                    flights?: {
                        flightNumber: string;
                        departureDate?: string | undefined;
                        arrivalDate?: string | undefined;
                    }[] | undefined;
                    hotels?: {
                        name: string;
                        address?: string | undefined;
                        checkinDate?: string | undefined;
                        checkoutDate?: string | undefined;
                    }[] | undefined;
                } | undefined;
            };
            output: {
                questions: {
                    type: "number" | "text" | "single" | "multi" | "date-range";
                    id: string;
                    question: string;
                    options?: string[] | undefined;
                    required?: boolean | undefined;
                }[];
            };
            meta: object;
        }>;
        generateTrip: _trpc_server.TRPCMutationProcedure<{
            input: {
                answers: Record<string, string | string[]>;
                aiQuestions: {
                    type: "number" | "text" | "single" | "multi" | "date-range";
                    id: string;
                    question: string;
                    options?: string[] | undefined;
                    required?: boolean | undefined;
                }[];
                aiAnswers: Record<string, string | string[]>;
                tripDetails?: {
                    flights?: {
                        flightNumber: string;
                        departureDate?: string | undefined;
                        arrivalDate?: string | undefined;
                    }[] | undefined;
                    hotels?: {
                        name: string;
                        address?: string | undefined;
                        checkinDate?: string | undefined;
                        checkoutDate?: string | undefined;
                    }[] | undefined;
                } | undefined;
            };
            output: {
                country: string;
                destination: string;
                weather: {
                    summary: string;
                    bestMonth: string;
                    temperatureRangeCelsius: string;
                };
                days: {
                    city: string;
                    dayNumber: number;
                    attractions: {
                        name: string;
                        address?: string | undefined;
                        notes?: string | undefined;
                        category?: string | undefined;
                        price?: {
                            amount: number;
                            currency: string;
                        } | undefined;
                        averageMinutesSpent?: number | undefined;
                        openingHours?: string | undefined;
                        websiteUrl?: string | undefined;
                    }[];
                    country?: string | undefined;
                    lodging?: string | undefined;
                    summary?: string | undefined;
                    dayTitle?: string | undefined;
                    region?: string | undefined;
                    slots?: {
                        id: string;
                        kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
                        city: string;
                        dayNumber: number;
                        startTime: string;
                        title: string;
                        country?: string | undefined;
                        notes?: string | undefined;
                        area?: string | undefined;
                        durationMinutes?: number | undefined;
                        endTime?: string | undefined;
                        estimatedPrice?: {
                            currency: string;
                            min?: number | undefined;
                            max?: number | undefined;
                            amount?: number | undefined;
                            label?: string | undefined;
                        } | undefined;
                        resolve?: {
                            query: string;
                            kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                            priority: "required" | "nice_to_have";
                            city: string;
                            allowUnresolved: boolean;
                            country?: string | undefined;
                            slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                            area?: string | undefined;
                            nearSlotId?: string | undefined;
                            nearText?: string | undefined;
                            cuisineHints?: string[] | undefined;
                            budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
                        } | undefined;
                        resolvedPlace?: {
                            name: string;
                            source: "google_places";
                            placeId: string;
                            address?: string | undefined;
                            rating?: number | undefined;
                            userRatingsTotal?: number | undefined;
                            priceLevel?: number | undefined;
                            location?: {
                                lat: number;
                                lng: number;
                            } | undefined;
                            mapsUrl?: string | undefined;
                        } | undefined;
                        routeFromPrevious?: {
                            fromSlotId: string;
                            toSlotId: string;
                            modes: {
                                walking?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                driving?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                transit?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                            };
                            notes?: string | undefined;
                            recommendedMode?: "walking" | "driving" | "transit" | undefined;
                        } | undefined;
                    }[] | undefined;
                    mapRoute?: {
                        mapsUrl: string;
                        dayNumber: number;
                        placeIds: string[];
                        unresolvedStopTitles: string[];
                    } | undefined;
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
                }[];
                paidAttractions: {
                    name: string;
                    category: string;
                    estimatedPriceUsd: string;
                    notes?: string | undefined;
                }[];
                meta?: zod.objectOutputType<{
                    placeResolveStats: zod.ZodOptional<zod.ZodObject<{
                        requested: zod.ZodOptional<zod.ZodNumber>;
                        resolved: zod.ZodOptional<zod.ZodNumber>;
                        unresolved: zod.ZodOptional<zod.ZodNumber>;
                        failed: zod.ZodOptional<zod.ZodNumber>;
                    }, "strip", zod.ZodTypeAny, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }>>;
                }, zod.ZodUnknown, "strip"> | undefined;
                bestTravelMonth?: string | undefined;
                tripAdvice?: {
                    bestAreasToStay: {
                        reason: string;
                        area: string;
                        bestFor?: string[] | undefined;
                    }[];
                    shouldSplitStay: boolean;
                    splitStayAdvice?: {
                        summary: string;
                        suggestedMoves: {
                            reason: string;
                            area: string;
                            fromDay: number;
                            toDay: number;
                        }[];
                    } | undefined;
                    transportAdvice?: string[] | undefined;
                    safetyOrLogisticsAdvice?: string[] | undefined;
                } | undefined;
            };
            meta: object;
        }>;
        modifyPlan: _trpc_server.TRPCMutationProcedure<{
            input: {
                itinerary: Record<string, unknown>;
                request: string;
            };
            output: {
                country: string;
                destination: string;
                weather: {
                    summary: string;
                    bestMonth: string;
                    temperatureRangeCelsius: string;
                };
                days: {
                    city: string;
                    dayNumber: number;
                    attractions: {
                        name: string;
                        address?: string | undefined;
                        notes?: string | undefined;
                        category?: string | undefined;
                        price?: {
                            amount: number;
                            currency: string;
                        } | undefined;
                        averageMinutesSpent?: number | undefined;
                        openingHours?: string | undefined;
                        websiteUrl?: string | undefined;
                    }[];
                    country?: string | undefined;
                    lodging?: string | undefined;
                    summary?: string | undefined;
                    dayTitle?: string | undefined;
                    region?: string | undefined;
                    slots?: {
                        id: string;
                        kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
                        city: string;
                        dayNumber: number;
                        startTime: string;
                        title: string;
                        country?: string | undefined;
                        notes?: string | undefined;
                        area?: string | undefined;
                        durationMinutes?: number | undefined;
                        endTime?: string | undefined;
                        estimatedPrice?: {
                            currency: string;
                            min?: number | undefined;
                            max?: number | undefined;
                            amount?: number | undefined;
                            label?: string | undefined;
                        } | undefined;
                        resolve?: {
                            query: string;
                            kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                            priority: "required" | "nice_to_have";
                            city: string;
                            allowUnresolved: boolean;
                            country?: string | undefined;
                            slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                            area?: string | undefined;
                            nearSlotId?: string | undefined;
                            nearText?: string | undefined;
                            cuisineHints?: string[] | undefined;
                            budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
                        } | undefined;
                        resolvedPlace?: {
                            name: string;
                            source: "google_places";
                            placeId: string;
                            address?: string | undefined;
                            rating?: number | undefined;
                            userRatingsTotal?: number | undefined;
                            priceLevel?: number | undefined;
                            location?: {
                                lat: number;
                                lng: number;
                            } | undefined;
                            mapsUrl?: string | undefined;
                        } | undefined;
                        routeFromPrevious?: {
                            fromSlotId: string;
                            toSlotId: string;
                            modes: {
                                walking?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                driving?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                transit?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                            };
                            notes?: string | undefined;
                            recommendedMode?: "walking" | "driving" | "transit" | undefined;
                        } | undefined;
                    }[] | undefined;
                    mapRoute?: {
                        mapsUrl: string;
                        dayNumber: number;
                        placeIds: string[];
                        unresolvedStopTitles: string[];
                    } | undefined;
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
                }[];
                paidAttractions: {
                    name: string;
                    category: string;
                    estimatedPriceUsd: string;
                    notes?: string | undefined;
                }[];
                meta?: zod.objectOutputType<{
                    placeResolveStats: zod.ZodOptional<zod.ZodObject<{
                        requested: zod.ZodOptional<zod.ZodNumber>;
                        resolved: zod.ZodOptional<zod.ZodNumber>;
                        unresolved: zod.ZodOptional<zod.ZodNumber>;
                        failed: zod.ZodOptional<zod.ZodNumber>;
                    }, "strip", zod.ZodTypeAny, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }>>;
                }, zod.ZodUnknown, "strip"> | undefined;
                bestTravelMonth?: string | undefined;
                tripAdvice?: {
                    bestAreasToStay: {
                        reason: string;
                        area: string;
                        bestFor?: string[] | undefined;
                    }[];
                    shouldSplitStay: boolean;
                    splitStayAdvice?: {
                        summary: string;
                        suggestedMoves: {
                            reason: string;
                            area: string;
                            fromDay: number;
                            toDay: number;
                        }[];
                    } | undefined;
                    transportAdvice?: string[] | undefined;
                    safetyOrLogisticsAdvice?: string[] | undefined;
                } | undefined;
            };
            meta: object;
        }>;
        editPlan: _trpc_server.TRPCMutationProcedure<{
            input: {
                userPrompt: string;
                maxOutputTokens?: number | undefined;
                temperature?: number | undefined;
            };
            output: {
                country: string;
                destination: string;
                weather: {
                    summary: string;
                    bestMonth: string;
                    temperatureRangeCelsius: string;
                };
                days: {
                    city: string;
                    dayNumber: number;
                    attractions: {
                        name: string;
                        address?: string | undefined;
                        notes?: string | undefined;
                        category?: string | undefined;
                        price?: {
                            amount: number;
                            currency: string;
                        } | undefined;
                        averageMinutesSpent?: number | undefined;
                        openingHours?: string | undefined;
                        websiteUrl?: string | undefined;
                    }[];
                    country?: string | undefined;
                    lodging?: string | undefined;
                    summary?: string | undefined;
                    dayTitle?: string | undefined;
                    region?: string | undefined;
                    slots?: {
                        id: string;
                        kind: "attraction" | "lodging" | "meal" | "transport" | "activity" | "free_time";
                        city: string;
                        dayNumber: number;
                        startTime: string;
                        title: string;
                        country?: string | undefined;
                        notes?: string | undefined;
                        area?: string | undefined;
                        durationMinutes?: number | undefined;
                        endTime?: string | undefined;
                        estimatedPrice?: {
                            currency: string;
                            min?: number | undefined;
                            max?: number | undefined;
                            amount?: number | undefined;
                            label?: string | undefined;
                        } | undefined;
                        resolve?: {
                            query: string;
                            kind: "restaurant" | "attraction" | "lodging" | "activity_provider";
                            priority: "required" | "nice_to_have";
                            city: string;
                            allowUnresolved: boolean;
                            country?: string | undefined;
                            slot?: "breakfast" | "lunch" | "dinner" | "snack" | undefined;
                            area?: string | undefined;
                            nearSlotId?: string | undefined;
                            nearText?: string | undefined;
                            cuisineHints?: string[] | undefined;
                            budgetHint?: "budget" | "moderate" | "comfort" | "luxury" | undefined;
                        } | undefined;
                        resolvedPlace?: {
                            name: string;
                            source: "google_places";
                            placeId: string;
                            address?: string | undefined;
                            rating?: number | undefined;
                            userRatingsTotal?: number | undefined;
                            priceLevel?: number | undefined;
                            location?: {
                                lat: number;
                                lng: number;
                            } | undefined;
                            mapsUrl?: string | undefined;
                        } | undefined;
                        routeFromPrevious?: {
                            fromSlotId: string;
                            toSlotId: string;
                            modes: {
                                walking?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                driving?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                                transit?: {
                                    durationMinutes: number;
                                    mapsUrl?: string | undefined;
                                    distanceMeters?: number | undefined;
                                } | undefined;
                            };
                            notes?: string | undefined;
                            recommendedMode?: "walking" | "driving" | "transit" | undefined;
                        } | undefined;
                    }[] | undefined;
                    mapRoute?: {
                        mapsUrl: string;
                        dayNumber: number;
                        placeIds: string[];
                        unresolvedStopTitles: string[];
                    } | undefined;
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
                }[];
                paidAttractions: {
                    name: string;
                    category: string;
                    estimatedPriceUsd: string;
                    notes?: string | undefined;
                }[];
                meta?: zod.objectOutputType<{
                    placeResolveStats: zod.ZodOptional<zod.ZodObject<{
                        requested: zod.ZodOptional<zod.ZodNumber>;
                        resolved: zod.ZodOptional<zod.ZodNumber>;
                        unresolved: zod.ZodOptional<zod.ZodNumber>;
                        failed: zod.ZodOptional<zod.ZodNumber>;
                    }, "strip", zod.ZodTypeAny, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }, {
                        requested?: number | undefined;
                        resolved?: number | undefined;
                        unresolved?: number | undefined;
                        failed?: number | undefined;
                    }>>;
                }, zod.ZodUnknown, "strip"> | undefined;
                bestTravelMonth?: string | undefined;
                tripAdvice?: {
                    bestAreasToStay: {
                        reason: string;
                        area: string;
                        bestFor?: string[] | undefined;
                    }[];
                    shouldSplitStay: boolean;
                    splitStayAdvice?: {
                        summary: string;
                        suggestedMoves: {
                            reason: string;
                            area: string;
                            fromDay: number;
                            toDay: number;
                        }[];
                    } | undefined;
                    transportAdvice?: string[] | undefined;
                    safetyOrLogisticsAdvice?: string[] | undefined;
                } | undefined;
            };
            meta: object;
        }>;
        enrichHotel: _trpc_server.TRPCMutationProcedure<{
            input: {
                name: string;
                destination?: string | undefined;
                checkinDate?: string | undefined;
                checkoutDate?: string | undefined;
            };
            output: {
                name: string;
                address?: string | undefined;
                neighborhood?: string | undefined;
                starRating?: number | undefined;
                priceRangePerNightUsd?: string | undefined;
                amenities?: string[] | undefined;
                notes?: string | undefined;
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
                accommodationStyles?: ("luxury" | "airbnb" | "hostel" | "budget-hotel" | "mid-hotel" | "boutique" | "camping")[] | undefined;
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
