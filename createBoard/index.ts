import {Board} from "./defines/models";
import {v4 as uuid4} from 'uuid';


const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

exports.handler = async (event) => {
    const input = event;
    console.log("board create request: ", input)
    const board = {
        display: undefined,
        boardId: String(uuid4()),
        name: input.name,
        state: 0,
        cardPacks: [],
        numberOfPlayers: 0,
        playerLimit: input.playerLimit
    } as Board;

    console.log("inserting: ", JSON.parse(JSON.stringify(board)))
    await dynamo.putItem({TableName: "boards", Item: JSON.parse(JSON.stringify(board))}).promise();


    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": JSON.stringify(board)
    }

};
