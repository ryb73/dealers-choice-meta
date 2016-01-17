#!/bin/bash

for path in ./*; do
  [ -d "${path}" ] || continue
  cd $path
  pwd
  npm test
  [[ $? == 0 ]] || break
  cd ..
done