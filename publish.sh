#!/bin/bash
cd $TRAVIS_BUILD_DIR || true
npx meteor-ci login $METEOR_SESSION_TOKEN
meteor publish || true
