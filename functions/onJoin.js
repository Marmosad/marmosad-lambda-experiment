const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event) => {
    //websocket body is passed in as a json string
    const input = JSON.parse(event['body'])
    const connection = {
        connectionId: event['requestContext']['connectionId'],
        boardId: input['boardId'],
        name: input['name']
    };
    // add connection
    await docClient.put({ TableName: "connections", Item: JSON.parse(JSON.stringify(connection)) }).promise();

    //get board we're trying to hit
    const board = await docClient.get({ TableName: "boards", Key: { "boardId": connection.boardId } }).promise();
    let players = board['Item']['players'];
    let count = board['Item']['numberOfPlayers'] + 1;


    players[connection.connectionId] = { 'name': connection.name, 'hand': [], score: 0 };
    //update params
    let params = {
        TableName: 'boards',
        Key: {
            "boardId": board.Item.boardId
        },

        UpdateExpression: "set players = :p, numberOfPlayers = :c",
        ExpressionAttributeValues: {
            ":p": players,
            ":c": count
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log('new player object on board', board, players)
    await docClient.update(params).promise();

};


const draw_hand = async() => {
    var lambda = new AWS.Lambda({
        region: 'us-east-1' //change to your region
    });

    let hand = await lambda.invoke({
        FunctionName: 'drawCard',
        Payload: JSON.stringify({"dummy": true}) // pass params
    }).promise();

    console.log(hand);
}
