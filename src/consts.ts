export let upstream = process.env.UPSTREAM_URL ?? "https://sineware.ca";
export let upstreamInternalUrl = process.env.UPSTREAM_INTERNAL_URL ?? "";
export let upstreamPostUrl = process.env.UPSTREAM_POST_URL ?? "";
export let hostUrl = process.env.HOST_URL ?? "http://localhost:3000";
export let port = process.env.PORT ?? 3000;
export let apiKey = process.env.API_KEY ?? "";

export let whitelistPaths = process.env.WHITELIST_PATHS?.split(",") ?? [];
export let blacklistPaths = process.env.BLACKLIST_PATHS?.split(",") ?? [];