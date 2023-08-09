# [Sineware Static HTTP Proxy](https://github.com/Sineware/static-proxy)
This is a service that generates a static copy of a website locally, and serves it.

Secure dynamic backends such as Wordpress from direct attacks with a controlled static version served to your clients.

## Environement
```bash
API_KEY=abc123 # API Key to access /sw-api/refresh endpoint (Authorization header with "Bearer <token>")
UPSTREAM_URL="https://sineware.ca" # Backend service URL
UPSTREAM_INTERNAL_URL="" # Specifiy if Static Proxy should access the upstream service from a different URL (ex. bypass a load balancer)
UPSTREAM_POST_URL="" # URL to send POST JSON requests

HOST_URL="http://localhost:3000" # URL the static server is hosted on

WHITELIST_PATHS="" # If set, these comma-separated route path are the only routes allowed
BLACKLIST_PATHS="/wp-admin,/wp-login,/xmlrpc" # route paths that are not allowed
```

## Handling POST requests
All POST requests (URL-encoded and body) are captured (and never pass through) and redirected as JSON to the endpoint set by the UPSTREAM_POST_URL env. Otherwise, POST requests are ignored.

## Refreshing Static Copy
Once the server has downloaded the contents of the upstream server for a given request, it will continue to serve those files without hitting the upstream. 

Your upstream server should notify Static Proxy whenever changes are made to invalidate the cache and redownload fresh content on the next request, by calling a POST request to `/sw-api/refresh` with the header `Authorization: Bearer API_KEY` set.

# License
```
    Copyright (C) 2023 Seshan Ravikumar

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>. 
```