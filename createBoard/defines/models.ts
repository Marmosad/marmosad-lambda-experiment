export interface Board {
    readonly cardPacks: string[];
    readonly name: string;
    numberOfPlayers: number;
    readonly playerLimit: number;
    readonly boardId: string;
    display?: BoardDisplay;
    state: number;
}


export interface BoardDisplay {
    blackCard: Card; //This should be a black card object
    submissions: Array<Card>;
    currentJudge: string; // The player ID of the person who is the judge
}

export interface PlayerDisplay extends BoardDisplay{
    playerHand: Array<Card>;
    score: Array<Score>
}


export interface Score {
    playerName: string;
    score: number;
    isJudge: boolean;
}


export interface FirebaseEndpoints {
    getPack: string;
    getWhiteCard:string;
    getBlackCard:string;
}

export interface Response {
    message: string;
    responseObj: Pack | Card;
}

export interface Pack {
    whiteCardCount: number;
    blackCardCount: number;
    whiteCardStack?: Card[];
    blackCardStack?: Card[]
}

export interface Card {
    cardId: number;
    body?: string;
    owner?: string;
}
