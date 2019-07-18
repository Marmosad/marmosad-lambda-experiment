module.exports = function pickJudge(players, currentJudge) {
    console.log(players);
    let playerIterator = Object.keys(players);
    let nextJudge;
    let i = 0;
    while (currentJudge !== players[playerIterator[i]] && i < playerIterator.length) {
        i++;
    }

    if (i === playerIterator.length)
        i = 0;
    else
        i = i + 1;
    nextJudge = playerIterator[i];
    console.log(playerIterator, nextJudge);
    return [i, nextJudge]
};