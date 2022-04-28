#!/bin/bash

# Create Meteor test app
meteor create --bare test-app 
mkdir -p test-app/packages/meteor-universe-i18n
shopt -s extglob
cp -r !(test-app) ./test-app/packages/meteor-universe-i18n
cd test-app
meteor npm install puppeteer

# Run tests
export TEST_BROWSER_DRIVER=puppeteer
export UNIVERSE_I18N_LOCALES=en-US
meteor test-packages universe:i18n --once --driver-package=meteortesting:mocha

# Clean up after tests
cd ..
rm -rf test-app
