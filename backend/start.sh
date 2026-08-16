#!/bin/sh
set -e
npm run migration:run:prod
npm run seed:prod
node dist/main.js
