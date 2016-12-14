#!/usr/bin/env bash

if lerna updated | grep -q "^-"; then
    echo "Publishing"
    lerna publish --yes --repo-version=$(node deployment/get-next-version.js)
else
    echo "Nothing to publish"
fi