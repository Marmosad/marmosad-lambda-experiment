module.exports = function pickJudge(players, currentJudge) {
    let playerIterator = Object.keys(players);
    let nextJudge;
    let i = 0;
    while (currentJudge !== playerIterator[i] && i < playerIterator.length) {
        console.log(playerIterator[i], currentJudge);
        i++;
    }

    console.log("the next judge index is", i);
    if (i === playerIterator.length)
        i = 0;
    else
        i = i + 1;
    nextJudge = playerIterator[i];
    console.log(playerIterator, nextJudge);
    return [currentJudge, nextJudge]
};
