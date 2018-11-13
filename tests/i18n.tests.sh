#!/bin/bash

UNIVERSE_I18N_LOCALES="en-US" meteor test-packages --settings tests/settings.coverage.json --port 8080 --driver-package meteortesting:mocha ./
