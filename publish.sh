#!/bin/bash

npx meteor-ci login $METEOR_SESSION_TOKEN
meteor publish
