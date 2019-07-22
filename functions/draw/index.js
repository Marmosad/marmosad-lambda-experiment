const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function (event, context, callback) {
    // TODO implement
    let board;
    let cardPacks;
    docClient.get({
        TableName: 'boards',
        Key: {
            "boardId": event.boardId
        }

    }).promise().then((data) => {
        board = data;
        let cardPackQuery = {
            RequestItems: {
                "cardPacks": {
                    Keys: []
                }
            }
        };
        console.log(data);
        console.log(JSON.stringify(board.Item.cardpacks));
        for (let cp of board.Item.cardPacks) {
            cardPackQuery.RequestItems.cardPacks.Keys.push({"cardPack": cp})
        }
        docClient.batchGet(cardPackQuery).promise().then(async (data) => {
            cardPacks = data;
            let ids = [];
            let cards = [];
            let toFetch = [];
            for (let i = 0; i < event.numCards; i++) {
                let [cardPack, cardId] = genCard(cardPacks.Responses.cardPacks, board.Item.drawnCards, event.cardType);

                board.Item.drawnCards[cardPack][event.cardType == "whiteCard" ? "whiteCards" : "blackCards"]['values'];

                toFetch.push(docClient.get({
                    TableName: cardPack,
                    Key: {
                        "cardId": cardId,
                        "cardType": event.cardType
                    }
                }).promise());
                ids.push([cardPack, cardId]);
            }

            cards = await Promise.all(toFetch);
            cards = cards.map((card, index) => {
                console.log(ids[index]);
                return {...card['Item'], "cardPack": ids[index][0]}
            });
            console.log(cards);
            let updateBoard = {
                TableName: 'boards',
                Key: {
                    "boardId": board.Item.boardId
                },
                UpdateExpression: "ADD #a.#b.#c :d",
                ExpressionAttributeNames: {
                    '#a': 'drawnCards',
                    '#b': "cardPack",
                    '#c': (event.cardType === 'whiteCard' ? 'whiteCards' : 'blackCards')
                },
                ExpressionAttributeValues: {
                    ":d": docClient.createSet(cards.map((card) => {
                        return card.cardId;
                    }))
                },
                ReturnValues: "UPDATED_NEW"
            };
            callback(null, cards);

            console.log(updateBoard);
            let a = await docClient.update(updateBoard).promise();
            console.log(a)

        }).catch(e => {
            callback(e)
        });
    }).catch(e => {
        callback(e)
    });


};

const genCard = (cp, drawn, cardType) => {
    const cpIndex = Math.floor(Math.random() * cp.length);
    const drawnSet = new Set(drawn[cp[cpIndex]['cardPack']][cardType == "whiteCard" ? "whiteCards" : "blackCards"]['values']);
    let card = Math.floor(Math.random() * cp[cpIndex][cardType == "whiteCard" ? "whiteCount" : "blackCount"]) + 1;
    while (drawnSet.has(card)) {
        card++;
    }

    return [cp[cpIndex]['cardPack'], card]
};
