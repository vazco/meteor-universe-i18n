#!/bin/bash

UNIVERSE_I18N_LOCALES="en-US" meteor test-packages --settings settings.coverage.json --port 8080 --driver-package practicalmeteor:mocha ./
