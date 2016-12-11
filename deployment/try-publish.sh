#!/usr/bin/env bash

export NODE_ENV="" # Lerna bug should be fixed soon

if lerna updated | grep -q "^-"; then
    echo "Publishing"
    lerna publish --yes --repo-version=$(node deployment/get-next-version.js)
else
    echo "Nothing to publish"
fi