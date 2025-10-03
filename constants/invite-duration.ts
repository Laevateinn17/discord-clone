import { DAY_IN_SECONDS, HOUR_IN_SECONDS, MINUTE_IN_SECONDS } from "./time";

export const INVITE_DURATIONS = {
    "30 minutes": MINUTE_IN_SECONDS * 30,
    "1 hour": HOUR_IN_SECONDS,
    "6 hour": HOUR_IN_SECONDS * 6,
    "12 hour": HOUR_IN_SECONDS * 12,
    "1 day": DAY_IN_SECONDS,
    "7 days": DAY_IN_SECONDS * 7,
    "Never": undefined
}