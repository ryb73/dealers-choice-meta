#!/bin/bash

for path in ./*; do
  [ -d "${path}" ] || continue
  cd $path
  pwd
  eval $1
  [[ $? == 0 ]] || break
  sleep 0.3 # slow it down so I can see all of them; top is getting cut off in my console for some reason
  cd ..
done