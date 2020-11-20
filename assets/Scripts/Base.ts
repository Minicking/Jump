import { matchPlayersPara, config } from './Config'
export class SDK {
    Listener = MGOBE.Listener;
    Room = new MGOBE.Room();

    // 状态变量
    is_matching = false;

    constructor() {

    }

    init(gameInfo) {
        let promise = new Promise(resolve => {
            this.Listener.init(gameInfo, config, event => {
                resolve(event.code)
                if(event.code === MGOBE.ErrCode.EC_OK){
                    this.Listener.add(this.Room);
                    this.setBroadcast();
                }
            });
        })

        return promise;
    }

    setBroadcast() {
        this.Room.onJoinRoom = this.onJoinRoom.bind(this);
    }

    /* Room广播方法设置 */
    onJoinRoom() {
        
    }

    /* ---------------------*/

    async matching () {
        let promise = new Promise(resolve => {
            this.Room.matchPlayers(matchPlayersPara, event => {
                resolve(event.code);
            })
        })
        return promise;
    }

    async cancelMatchinig () {
        const cancelMatchPara = {
            matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX,
        };
        let promise = new Promise(resolve => {
            this.Room.cancelPlayerMatch(cancelMatchPara, event => {
                resolve(event.code);
            });
        })

        return promise;
    }

    sendToClient (data) {
        let para = {
            recvType: MGOBE.ENUM.RecvType.ROOM_SOME,
            recvPlayerList: [this.Room.roomInfo.playerList[0].id, this.Room.roomInfo.playerList[1].id],
            msg: data,
        }
        this.Room.sendToClient(para, event => {
            if (event.code === 0){
                return true;
            } else {
                return false;
            }
        })
    }

    async getRoomInfo () {
        let promise = new Promise(resolve => {
            MGOBE.Room.getMyRoom(event => {
                resolve(event.data.roomInfo);
            })
        });

        return promise;
    }

    async leaveRoom () {
        let promise = new Promise(resolve => {
            this.Room.leaveRoom({}, event => {
                resolve(event.code);
            })
        });

        return promise;
    }

}