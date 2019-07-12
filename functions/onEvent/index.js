const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();


const handleStart = require('./start');
const handleChat = require('./chat');
const updateDisplay = require('./updateDisplay');
const handleSubmit = require('./submit');
const handleJudge = require('./judge');
let apigwManagementApi;
let send = async (connectionId, data) => {
    await apigwManagementApi.postToConnection({ConnectionId: connectionId, Data: data}).promise();
};


exports.handler = async (event) => {
    console.log("handling: ", event);

    //init api management
    apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });

    let gameEvent = JSON.parse(event['body'])['action'];

    if (gameEvent === 'join') {
        return await join(event);
    }

    const connectionId = event['requestContext']['connectionId'];
    let connection = await docClient.get({TableName: "connections", Key: {"connectionId": connectionId}}).promise();
    let board = await docClient.get({TableName: "boards", Key: {"boardId": connection.Item.boardId}}).promise();
    console.log("current game event, ", gameEvent);

    switch (gameEvent) {
        case 'start':
            await handleStart(board);
            board = await docClient.get({
                TableName: "boards",
                Key: {"boardId": connection.Item.boardId},
                "ConsistentRead": true
            }).promise();
            await updateDisplay(board.Item, send);
            break;
        case 'chat':
            await handleChat(board.Item, send, JSON.parse(event['body'])['message'], connectionId);
            break;
        case 'nudge':
            board = await docClient.get({
                TableName: "boards",
                Key: {"boardId": connection.Item.boardId},
                "ConsistentRead": true
            }).promise();
            await updateDisplay(board.Item, send);
            break;
        case 'submit':
            await handleSubmit(board.Item, JSON.parse(event['body'])['card'], board.Item["players"][connectionId]);
            board = await docClient.get({
                TableName: "boards",
                Key: {"boardId": connection.Item.boardId},
                "ConsistentRead": true
            }).promise();
            await updateDisplay(board.Item, send);
            break;
        case 'judge':
            await handleJudge(board.Item, JSON.parse(event['body'])['card'], connection.Item.boardId);
            board = await docClient.get({
                TableName: "boards",
                Key: {"boardId": connection.Item.boardId},
                "ConsistentRead": true
            }).promise();
            await updateDisplay(board.Item, send);
            break;
        default:
            break;
    }

    console.log("completed event handling");
    return {}
};

async function join(event) {
//add connection first
    const input = JSON.parse(event['body']);
    const connection = {
        connectionId: event['requestContext']['connectionId'],
        boardId: input['boardId'],
        name: input['name']
    };
    // add connection
    await docClient.put({TableName: "connections", Item: JSON.parse(JSON.stringify(connection))}).promise();
    let board = await docClient.get({TableName: "boards", Key: {"boardId": connection.boardId}}).promise();
    let players = board['Item']['players'];
    players[connection.connectionId] = {'name': connection.name, 'hand': [], connectionId: connection.connectionId};

    //update params
    let params = {
        TableName: 'boards',
        Key: {
            "boardId": board.Item.boardId
        },

        UpdateExpression: "set #a.#b = :p, #n = #n + :i, #d.#s = list_append(#d.#s, :s)",
        ExpressionAttributeNames: {
            '#a': 'players',
            '#b': connection.connectionId,
            '#n': "numberOfPlayers",
            '#d': "display",
            '#s': "score"
        },
        ExpressionAttributeValues: {
            ":p": {
                'name': connection.name, 'hand': [], "connectionId": connection.connectionId,
                "played": false
            },
            ":i": 1,
            ":s": [{"name": connection.name, "score": 0, "isCurrentJudge": false}]
        },
        ReturnValues: "UPDATED_NEW"
    };

    await docClient.update(params).promise();
    board = await docClient.get({TableName: "boards", Key: {"boardId": connection.boardId}}).promise();
    await updateDisplay(board.Item, send);
    return {};
}

