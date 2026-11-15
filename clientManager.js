
// Blockclye Client Writed by ErickCraftStudios
import * as claicy from './claicyscript.js';
import * as thridyParty from './claicy.js';

let objects = [];

// Function For Html Client
window.ConectServer = function ConectServer(serverUrl) {
    const socket = new WebSocket(serverUrl);

    /** @type { WebSocket? } */
    let priv_serv;

    function priv_servmsg(msg) {
        if (priv_serv !== undefined && priv_serv !== null) {
            if (socket.readyState !== WebSocket.OPEN) return;

            if (typeof msg === 'object')
                return socket.send(JSON.stringify(msg));

            socket.send(String(msg));
        }
    }

    function priv_handler(msg) {
        if (typeof msg === 'object') {
            return ;
        }
    }

    socket.addEventListener('open', function(ev) {
        priv_serv = socket; // confirm Server entry
    })

    socket.addEventListener('message', function priv_serv_onmsg(ev) {
        let data = String(ev.data);
        try {
            let jso = JSON.parse(data)
            data = jso;
        } catch (error) {
        }
        priv_handler(data);
    })

    let priv_mgr = {
        priv_serv,
        priv_servmsg,
        priv_handler,
        socket
    }

    return priv_mgr;
}