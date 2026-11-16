
import * as claicy from './claicyscript.js';
import * as fs from 'node:fs';
import * as path from 'node:path'
import { fileURLToPath } from 'node:url';
import { ClaicyObject } from './claicy.js'

let allInitBoot = ``;

// Directory where the script is
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Payload that the Engine Starts on server
const serverInitPayload = [
    'extender.clay',
    'vector.clay',
    'world.clay',
    'sprite.clay',
    'pyshic.clay',
];

// Resource instancer name
function Resource(url) {
    return path.join(__dirname, 'Resources', url);
}

// Actor finder such as find a movie actor
function Actor(url) {
    return fs.readFileSync(Resource(url), 'ascii');
}

// Code runner macro for simplify code
async function run(content, lab) {
    return await claicy.run(claicy.parse(claicy.tokenize(content)), lab);
}

// Creates all resources for server init
async function PreInitServer(payload) {
    let lib = claicy.exportLibrary();

    lib.Math.object.cos = { type: 'func', func: (ps) => Math.cos(...ps) };
    lib.Math.object.sin = { type: 'func', func: (ps) => Math.sin(...ps) };
    lib.Math.object.hypot = { type: 'func', func: (ps) => Math.hypot(...ps) };

    // Payload Runner
    for (const filename of payload) {
        let nat = Actor(filename);
        allInitBoot += nat + "\n";
        const exports = await run(nat, lib);

        // Script exporting injection
        for (const [name, value] of Object.entries(exports)) {
            if (!(name in lib)) {
                lib[name] = value;
            }
        }
    }

    return lib;
}

let payloadingLoad = await PreInitServer(serverInitPayload);
let [nsp, props, raw] = ClaicyObject.modernCast(payloadingLoad);

fs.writeFileSync(path.join(__dirname, 'boot.clay'), allInitBoot, 'ascii');

let {
    Vector2,
    repr,
    Math: MathClay,
    Position,
    NextEnginerPyshic
} = props;
