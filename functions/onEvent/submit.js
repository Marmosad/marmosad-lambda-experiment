let AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = async function handleSubmit(board, card, player) {
    if (board.currentJudge === player.connectionId){
        console.log('judge attempted to play white card');
        return;
    }
    if (player.played) {
        console.log('can\'t play, buddy');
        return;
    }

    if (board.state !== 1) {
        console.log("not the right phase")
    }
    let playedCard = {};

    let toPlay = -1;
    for (let i in player.hand) {
        console.log(player.hand[i].cardPack, card.cardPack, player.hand[i].cardId, card.cardId);
        if (player.hand[i].cardPack === card.cardPack && player.hand[i].cardId === card.cardId) {
            toPlay = i;
        }
    }

    console.log("toplay", toPlay);
    if (toPlay >= 0) {
        playedCard = player.hand[toPlay];
        player.hand.splice(toPlay, 1);
    }
    else
        return;
    player.played = true;

    // updating board
    let params = {
        TableName: 'boards',
        Key: {
            "boardId": board.boardId
        },

        UpdateExpression: "set #a.#b = :p, add #d.#w :c",
        expressionAttributeNames: {
            '#a': 'players',
            '#b': player.connectionId,
            '#d': 'display',
            '#w': 'whiteCards'
        },
        ExpressionAttributeValues: {
            ":p": player,
            ":c": playedCard
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log(player);
    await docClient.update(params).promise();

};
