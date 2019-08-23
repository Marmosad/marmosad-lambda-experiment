const sendAll = async (board, msg, send) => {
    let updatePromises = [];
    for (let id in board.players) {
        updatePromises.push(send(board.players[id].connectionId, JSON.stringify(msg)))
    }
    await Promise.all(updatePromises);
    return {};
};

module.exports = sendAll;