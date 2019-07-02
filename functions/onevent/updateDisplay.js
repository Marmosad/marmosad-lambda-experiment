module.exports = async function updateDisplay(board, send) {
    let updatePromises = [];
    for (let id in board.players) {
        console.log(board);
        let displayObject = {"gameEvent": "update", "hand": board.players[id].hand, "display": board.display, "currentJudge": board.currentJudge}
        updatePromises.push(send(board.players[id].connectionId, JSON.stringify(displayObject)))
    }
    await Promise.all(updatePromises);
};
