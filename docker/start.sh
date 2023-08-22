#!/usr/bin/env bash
set -e

service nginx start
tail -f /var/log/nginx/access.log -f /var/log/nginx/error.log &
npm start