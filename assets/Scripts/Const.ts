enum FaceStatus {
    LU, //左上
    RU, //右上
    RB, //右下
    LB  //左下
}

enum GameStatus {
    INIT,//进游戏的初始状态
    MATCHING,//匹配中状态
    RUNING,//自己进行行动状态
    WAIT,//等待另一方行动状态
    offline,//掉线状态
    END//结束进行结算状态
}

export {FaceStatus, GameStatus}