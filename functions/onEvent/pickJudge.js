module.exports = function pickJudge(players, currentJudge) {
    let playerIterator = Object.keys(players);
    let nextJudge;
    let i = 0;
    console.log("Current judge ", currentJudge," picking judge from: ", playerIterator);
    // noinspection EqualityComparisonWithCoercionJS
    while (currentJudge != playerIterator[i] && i < playerIterator.length) {
        i++;
    }

    console.log("the next judge index is", i);
    if (i === playerIterator.length)
        i = 0;
    else
        i = i + 1;
    nextJudge = playerIterator[i];
    return [currentJudge, nextJudge]
};
