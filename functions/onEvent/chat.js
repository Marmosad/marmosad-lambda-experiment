module.exports = async function updateDisplay(board, send, msg, connectionId) {
    console.log("propagating chat: ", msg);
    let messages = [];
    for (let id in board.players) {
        let chat = {"gameEvent": "chat", "message": {"name": board.players[id].name, "message": msg, "you": (id === connectionId)}};
        messages.push(send(board.players[id].connectionId, JSON.stringify(chat)));
    }
    await Promise.all(messages);
};
