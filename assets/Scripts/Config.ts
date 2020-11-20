import { randomRangeInt } from "cc";

let gameInfo = {
    openId: randomRangeInt(1, 100).toString(),
    gameId: 'obg-4zid10f3',
    secretKey: '610f99f525ff3970e69b21527329af1faf8460b1',
};

let playerInfo = {
    name: 'tzf',
    customPlayerStatus: 1,
    customProfile: "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=4231371155,3480927201&fm=26&gp=0.jpg",
    matchAttributes: [{
        name: 'level',
        value: 1,
    }]
}

let matchPlayersPara = {
    playerInfo,
    matchCode: 'match-qv8vbuom',
}

let config = {
    url: '4zid10f3.wxlagame.com',
    reconnectMaxTimes: 5,
    reconnectInterval: 1000,
    resendInterval: 1000,
    resendTimeout: 10000,
    isAutoRequestFrame: true,
};

export {gameInfo, config, playerInfo, matchPlayersPara};