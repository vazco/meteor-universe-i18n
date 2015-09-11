var JSONC = Npm.require('json-comments');
var YAML = Npm.require('yamljs');

var handler = function (compileStep) {
    var source = compileStep.read().toString('utf8');
    var outputFile = compileStep.inputPath + '.js';
    var path = compileStep.inputPath.split('.i18n.');
    var type = path[path.length - 1].toLowerCase();
    var translations;
    if (type === 'json') {
        try {
            translations = JSONC.parse(source);
        } catch (e) {
            compileStep.error({
                message: 'Cannot parse json file: '+e.toString,
                sourcePath: compileStep.inputPath
            });
            return;
        }
    } else {
        try {
            translations = YAML.parse(source);
        } catch(e){
            compileStep.error({
                message: 'Cannot parse yaml file: '+e.toString,
                sourcePath: compileStep.inputPath
            });
            return;
        }
    }

    var locale = translations._locale || getLocaleFromPath(compileStep);
    locale = locale.toLowerCase();
    var namespace = typeof translations._namespace === 'string' ? translations._namespace : compileStep.packageName || '';
    delete translations._locale;
    delete translations._namespace;
    if (!locale) {
        compileStep.error({
            message: 'Cannot find localization for file: ' +
            compileStep.inputPath + (compileStep.packageName ? 'in package: ' + compileStep.packageName : '') +
            '. Please change file name or set _locale key in file',
            sourcePath: compileStep.inputPath
        });
        return;
    }
    var data = 'System.import("{universe:i18n}").then(function(m){' +
        'm.i18n.addTranslations(\'' + locale + '\',\'' + namespace + '\',' + JSON.stringify(translations) + ');' +
        '});';


    compileStep.addJavaScript({
        path: outputFile,
        sourcePath: compileStep.inputPath,
        data: data
    });
};

Plugin.registerSourceHandler('i18n.json', handler);
Plugin.registerSourceHandler('i18n.yml', handler);

var inputReg = /\.i18n\.(?:json|yml)/;
var fullInputPath1 = /[\/\\]([a-z]{2}?(?:[\/\\][a-z]{2}))\.i18n\.(?:json|yml)$/;
var lacaleTestReg = /^[a-z]{2}(?:(?:_[a-z]{2})|$)/;

function getLocaleFromPath (step) {
    var path = step.inputPath.toLowerCase();
    var locale = path.replace(/\.i18n\.(?:json|yml)$/, '').replace('-', '_');
    if (lacaleTestReg.test(locale)) {
        return locale;
    }
    path = step.fullInputPath.toLowerCase();
    locale = path.match(fullInputPath1, path);
    if (locale && locale.length > 1) {
        return locale[1].replace(/[\/\\]/, '_');
    }
    path = path.slice(0, -(step.inputPath.toLowerCase().length));
    locale = path.match(/[\/\\]([a-z]{2}(?:[_-][a-z]{2})?)[\/\\]$/);
    if (locale && locale.length > 1) {
        return locale[1].replace(/[\/\\]/, '_');
    }
}