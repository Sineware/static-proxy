# Sineware Static HTTP Proxy
This is a service that generates a static copy of a website locally, and serves it.

Secure dynamic backends such as Wordpress from direct attacks with a controlled static version served to your clients.

## Environement
```bash
API_KEY=abc123 # API Key to access /sw-api/refresh endpoint (Authorization header with "Bearer <token>")
UPSTREAM_URL="https://sineware.ca" # Backend service URL
UPSTREAM_POST_URL="" # URL to send POST JSON requests

HOST_URL="http://localhost:3000" # URL the static server is hosted on

WHITELIST_PATHS="" # If set, these comma-separated route path are the only routes allowed
BLACKLIST_PATHS="/wp-admin,/wp-login,/xmlrpc" # route paths that are not allowed
```

## Handling POST requests
All POST requests (URL-encoded and body) are captured (and never pass through) and redirected as JSON to the endpoint set by the UPSTREAM_POST_URL env. Otherwise, POST requests are ignored.
