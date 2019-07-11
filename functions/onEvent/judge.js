let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = async function handleJudge(board, card, player) {
    if (board.currentJudge !== player.connectionId) {
        console.log('None judge tried to judge');
        return;
    }

    if (player.played) {
        console.log('can\'t play, buddy');
        return;
    }

    if (board.state !== 1) {
        console.log("not the right phase")
    }

    let toPlay = -1;
    for (let i in player.hand) {
        console.log(player.hand[i].cardPack, card.cardPack, player.hand.cardId, card.cardI);
        if (player.hand[i].cardPack === card.cardPack && player.hand.cardId === card.cardId) {
            toPlay = i;
        }
    }
    if (toPlay >= 0) {
        player.hand.splice(i, 1)
    } else
        return;
    player.played = true;

    // updating board
    let params = {
        TableName: 'boards',
        Key: {
            "boardId": board.Item.boardId
        },

        UpdateExpression: "set #a.#b = :p, add numberOfPlayers :i",
        expressionAttributeNames: {
            '#a': 'players',
            '#b': player.connectionId,
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ":p": player
        },
        ReturnValues: "UPDATED_NEW"
    };
    //
    // UpdateExpression = "SET map.#number = :string"
    // ExpressionAttributeNames = { "#number" : "1" }
    // ExpressionAttributeValues = { ":string" : "the string to store in the map at key value 1" }
    // ConditionExpression = "attribute_not_exists(map.#number)"

    console.log('new player object on board', board, players);
    await docClient.update(params).promise();


};
