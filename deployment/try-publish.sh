#!/usr/bin/env bash

export NODE_ENV="" # Lerna bug should be fixed soon

if ! lerna updated | grep -q "^-"; then
    echo "Nothing to publish"
    exit
fi

echo "Publishing"

lerna publish --yes --repo-version=$(node deployment/get-next-version.js)

ansible-galaxy install leonidas.nvm,v1.0.0