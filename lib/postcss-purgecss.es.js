import path from 'path';
import postcss from 'postcss';
import Purgecss from 'purgecss';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

//      

var CONFIG_FILENAME = 'purgecss.config.js';
var ERROR_CONFIG_FILE_LOADING = 'Error loading the config file';

var loadConfigFile = function loadConfigFile(configFile) {
    var pathConfig = typeof configFile === 'undefined' ? CONFIG_FILENAME : configFile;
    var options = void 0;
    try {
        var t = path.resolve(process.cwd(), pathConfig);
        options = require(t);
    } catch (e) {
        throw new Error(ERROR_CONFIG_FILE_LOADING + e.message);
    }
    return options;
};

var index = postcss.plugin('postcss-plugin-purgecss', function (opts) {
    return function (root) {
        if (typeof opts === 'string' || typeof opts === 'undefined') opts = loadConfigFile(opts);

        if (!opts.css || !opts.css.length) {
            opts.css = ['__postcss_purgecss_placeholder'];
        }

        var purgecss = new Purgecss(opts);
        purgecss.root = root;

        // Get selectors from content files
        var _purgecss$options = purgecss.options,
            content = _purgecss$options.content,
            extractors = _purgecss$options.extractors;


        var fileFormatContents = content.filter(function (o) {
            return typeof o === 'string';
        });
        var rawFormatContents = content.filter(function (o) {
            return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
        });

        var cssFileSelectors = purgecss.extractFileSelector(fileFormatContents, extractors);
        var cssRawSelectors = purgecss.extractRawSelector(rawFormatContents, extractors);

        // Get css selectors and remove unused ones
        var cssSelectors = new Set([].concat(toConsumableArray(cssFileSelectors), toConsumableArray(cssRawSelectors)));

        // purge selectors
        purgecss.getSelectorsCss(cssSelectors);

        // purge keyframes
        if (purgecss.options.keyframes) purgecss.removeUnusedKeyframes();

        // purge font face
        if (purgecss.options.fontFace) purgecss.removeUnusedFontFaces();
    };
});

export default index;
