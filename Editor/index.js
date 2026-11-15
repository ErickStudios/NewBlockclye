import * as editor from './ide.js';

// Project
function startProject(str) {
    if (typeof str !== 'string')
        throw new TypeError('projectType must be String');
}; window.startProject = startProject;

editor.createEditor()