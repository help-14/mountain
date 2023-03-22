var wsConnected = false
var ws = null

function SetupWebsocket() {
    ws = new WebSocket("ws://localhost:8081/ws");

    ws.onopen = function (evt) {
        ws.send("Hello WebSockets!")
        wsConnected = true
    };

    ws.onmessage = function (evt) {
        console.log("Received Message: " + evt.data);
    };

    ws.onclose = function (evt) {
        wsConnected = false
        ws.close()
        console.error("Websocket disconnected, retry after 5 seconds...");
        setTimeout(SetupWebsocket, 5000)
    };
}

function SendSocket(data) {
    if (typeof data === 'string' || data instanceof String)
        ws.send(data)
    else
        ws.send(JSON.stringify(data))
}

//SetupWebsocket()
