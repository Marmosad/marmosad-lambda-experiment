module.exports = async function updateDisplay(board, send) {
    console.log('started update');
    let updatePromises = [];
    for (let id in board.players) {
        console.log(board);
        let displayObject = {
            "gameEvent": "update",
            "hand": board.players[id].hand,
            "display": board.display,
            "currentJudge": (board.currentJudge === id),
            "gameState": board.state
        };
        // Strip out connection Id
        let scoreList = [];
        for (let player in displayObject.display.score) {
            scoreList.push(displayObject.display.score[player])
        }
        displayObject.display.score=scoreList;
        updatePromises.push(send(board.players[id].connectionId, JSON.stringify(displayObject)));
    }
    await Promise.all(updatePromises);
    console.log('completed update');
    return {};
};
