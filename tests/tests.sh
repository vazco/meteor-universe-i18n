#!/bin/sh

# Create Meteor test app
meteor create --bare test-app 
cd test-app
meteor npm install puppeteer
mkdir packages
cp -r ../ ./packages/meteor-universe-i18n
rm -rf ./packages/meteor-universe-i18n/test-app

# Run tests
export TEST_BROWSER_DRIVER=puppeteer
export UNIVERSE_I18N_LOCALES=en-US
meteor test-packages universe:i18n --once --driver-package=meteortesting:mocha

# Clean up after tests
cd ..
rm -rf test-app