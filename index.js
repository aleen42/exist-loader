/**
 *                                                               _
 *   _____  _                           ____  _                 |_|
 *  |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *  | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *  |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *  |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *  ===============================================================
 *             More than a coder, More than a designer
 *  ===============================================================
 *
 *  - Document: index.js
 *  - Author: aleen42
 *  - Description: The main entry of this loader
 *  - Create Time: Nov, 9th, 2017
 *  - Update Time: Nov, 9th, 2017
 *
 */

/** @namespace module */
/** @namespace require */
var loaderUtils = require('loader-utils');
var path = require('path');
var fs = require('fs');

module.exports = function () {
    this.cacheable && this.cacheable();

    var params = loaderUtils.parseQuery(this.resourceQuery);

    /** compile time */
    if (params.type === 'compile') {
        var root = this._compiler.options.resolve.root;
        var exportWhenExisted = function (dir, filePath) {
            return fs.existsSync(path.resolve(dir, filePath)) ? `module.exports = require('${filePath}')` : '';
        };

        if (typeof root === 'string') {
            /** string type */
            return exportWhenExisted(root, params.path);
        }  else if (root.length) {
            /** array type */
            var len = root.length;
            for (var i = 0; i < len; i++) {
                var result = exportWhenExisted(root[i], params.path);
                if (result) {
                    return result;
                }
            }
        }

        return '';
    }

    /** run time */
    if (params.type === 'run') {
        return `
            module.exports = function (callback) {
                var xhr = new XMLHttpRequest();
                var content = null;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 304 || xhr.status === 202) {
                            /** load JSON files */
                            if (/\\.json$/gi.test('${params.path}')) {
                                content = JSON.parse(
                                    xhr.responseText
                                    .replace(/\\u2028/g, '\\\\u2028')
                                    .replace(/\\u2029/g, '\\\\u2029')
                                );
                                
                                if (${params.async}) {
                                    callback && callback(content)
                                }
                            }
                        }
                    }
                }
                
                xhr.open('GET', '${params.path}', ${params.async});
                xhr.send();
                
                return content;
            };
        `;
    }
};
