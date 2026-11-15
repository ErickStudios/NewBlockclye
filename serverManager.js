
import * as claicy from './claicyscript.js';
import * as fs from 'node:fs';
import * as path from 'node:path'
import { fileURLToPath } from 'node:url';
import * as builtin from './ResourcesJs/mainer.js'

var { 
    IColor, 
    IOrientator, 
    IVector3,
    BaseBody,
    ClaicyObject
} = builtin

import { WebSocketServer } from 'ws';

// Directory where the script is
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Payload that the Engine Starts on server
const serverInitPayload = [
    'extends.clay',
    'client.clay',
    '3d.clay',
    'p3d.clay',
    'validater.clay',
    'host.clay',
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

    // Payload Runner
    for (const filename of payload) {
        const exports = await run(Actor(filename), lib);

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

function TakeServerStart() {
    const wss = new WebSocketServer({ port: 8080 });

    let playersFinders = {}

    wss.on('connection', (socket, req) => {
        socket.on('message', (data) => {
        });

        playersFinders[req.socket.remoteAddress] = true;

        socket.send()
    });
}

TakeServerStart();

//console.log(payloadingLoad.repr.func([payloadingLoad.getGlobal.func([])]))