const sendAll = async (board, msg) => {
    let updatePromises = [];
    for (let id in board.players) {
        console.log(board);
        updatePromises.push(msg(board.players[id].connectionId, JSON.stringify(msg)))
    }
    await Promise.all(updatePromises);
    console.log('completed msg to all')
};

module.exports = sendAll;