const io = require('socket.io-client')
var options = {
    "force new connection": true,
    "reconnection": true,
    "reconnectionDelay": 2000,
    "reconnectionDelayMax": 60000,
    "reconnectionAttempts": "Infinity",
    "timeout": 10000,
    "transports": ["websocket"]
}
const socket = io("ws://127.0.0.1:5002", options)

socket.on("connect", () => {
    socket.send({
        message: "Hii",
        group_id: "60fc88c8edffd80298379d28",
        user_id: "60f9825e5538f22ad012dff8"
    })
});

socket.on("disconnect", () => {
    console.log("Disconnected => " + socket.id);
});

socket.on("vishnu", (data) => {
    console.log(data)
});