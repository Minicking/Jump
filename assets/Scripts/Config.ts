import { randomRangeInt } from "cc";

/* 一些游戏基本参数的原始数据,使用时先获取再进行具体赋值 */

// 游戏基本信息:用户ID,游戏ID,秘钥
let gameInfo = {
    openId: 0,
    gameId: 'obg-4zid10f3',
    secretKey: '610f99f525ff3970e69b21527329af1faf8460b1',
};

// 用户基本信息:用户名,状态,头像数据,匹配数据
let playerInfo = {
    name: 'tzf',
    customPlayerStatus: 1,
    customProfile: "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=4231371155,3480927201&fm=26&gp=0.jpg",
    matchAttributes: [{
        name: 'level',
        value: 1,
    }]
}

// 匹配信息: 用户基本信息,匹配规则码
let matchPlayersPara = {
    playerInfo,
    matchCode: 'match-na9u3tge',
}

// 队伍信息: 队伍名,队伍类型,最大玩家数,是否限制加入房间,--,自定义队组属性,用户信息
let groupPara = {
    groupName: '',
    groupType: MGOBE.ENUM.GroupType.GROUP_LIMITED,
    maxPlayers: 2,
    isForbidJoin: false,
    isPersistent: false,
    customProperties: '',
    playerInfo,
}

// SDK基本配置
let config = {
    url: '4zid10f3.wxlagame.com',
    reconnectMaxTimes: 5,
    reconnectInterval: 1000,
    resendInterval: 1000,
    resendTimeout: 10000,
    isAutoRequestFrame: true,
};

export {gameInfo, config, playerInfo, matchPlayersPara, groupPara};