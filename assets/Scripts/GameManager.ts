import { _decorator, Component, Node, Prefab, Vec3, deserialize, random, randomRange, instantiate, GFXSamplerState, Game, Camera, NodePool, tween, randomRangeInt, Canvas, LabelComponent, CCInteger, Quat, CCFloat, Label } from 'cc';
const { ccclass, property } = _decorator;
import { Player } from './Player'
import { GameStatus, FaceStatus} from './Const'
import { getRotaionQuat } from './Util'
import { gameInfo, config, matchPlayersPara, playerInfo } from './Config'
import { SDK } from './Base'
import './MGOBE/MGOBE.js';

@ccclass('GameManager')
export class GameManager extends Component {
    public SDK = new SDK();

    //角色的预制件
    @property({type: Prefab})
    public playerPrfb: Prefab = null;

    //方块的预制件
    @property({type: Prefab})
    public GroundPrfb: Prefab = null;

    //玩家控制的角色对象
    @property({type: Player})
    public Player: Player = null;

    //另外一队的角色对象
    @property({type: Node})
    public OtherTeam: Node = null;

    //当前踩着的方块对象
    @property({type: Node})
    public curGround: Node = null;

    //游戏中所使用的摄像头
    @property({type: Camera})
    public camera: Camera = null;

    //积分label
    @property({type: LabelComponent})
    public socreLabel: LabelComponent = null;

    //UI
    @property({type: Node})
    public UI: Node = null;

    //最大的方块存留数,多余的地块会被销毁
    @property({type: CCInteger})
    public maxGround: number = 6;

    @property({type: CCFloat})
    public randMin: number = 1;

    @property({type: CCFloat})
    public randMax: number = 3;



    //下一个方块对象
    private nextGround: Node = null;

    //当前游戏的运行状态
    private _State: GameStatus = GameStatus.INIT;

    //队友游戏运行状态
    private _otherState: GameStatus = GameStatus.INIT;

    //游戏过程中的方块列表
    private _groundList: Node[] = [];

    //编辑器中手动放置的摄像机预设位置
    private _origin_camera_pos = new Vec3();


    private _score = -1;

    set State(stat: GameStatus){
        switch (stat) {
            case GameStatus.MATCHING:
                /* 在此处调用SDK进入匹配队列 */
                break;

            case GameStatus.RUNING:
                this.Player.control = true;
                break;
            
            case GameStatus.WAIT:
                this.Player.control = false;
                break;
            
            case GameStatus.END:
                this.Player.control = false;
                break;
        
            default:
                break;
        }
    }

    set otherState(stat: GameStatus) {
        switch(stat) {

        }
    }

    async start (){
        // // 初始化SDK,会生成playerId
        // let code = await this.SDK.init();
        // if(code === MGOBE.ErrCode.EC_OK) {
        //     console.log('初始化SDK成功');
        //     console.log('my id:', MGOBE.Player.id)

        //     // this.SDK.Room.
        //     this.SDK.Room.onUpdate = this.roomUpdate.bind(this);
        //     this.UI.getChildByName('StartBoard').active = true;
        //     this.UI.getChildByName('MatchingBoard').active = false;
        //     this.UI.getChildByName('MainBoard').active = false;
        //     this.camera.node.getPosition(this._origin_camera_pos)
        //     this.Player.onJumpComplete = this.onJumpComplete.bind(this);
        //     this.Player.onJumpDead = this.onJumpDead.bind(this);
        //     this.Player._ground = this.curGround;
        //     this.nextGround = this.curGround;
        //     this._groundList.push(this.curGround);
        // } else {
        //     console.log('初始化SDK失败,code:'+code);
        // }

    }

    // 手动触发初始化,测试使用
    async startInit() {
        // 初始化SDK,会生成playerId
        let g = gameInfo;
        g.openId = this.UI.getChildByName('InitBoard').getChildByName('EditBox').getChildByName('TEXT_LABEL').getComponent(Label).string;
        console.log('openID:', g.openId);
        let code = await this.SDK.init(g);
        if(code === MGOBE.ErrCode.EC_OK) {
            console.log('初始化SDK成功');
            console.log('my id:', MGOBE.Player.id)

            // this.SDK.Room.
            this.SDK.Room.onUpdate = this.roomUpdate.bind(this);
            this.UI.getChildByName('StartBoard').active = true;
            this.UI.getChildByName('MatchingBoard').active = false;
            this.UI.getChildByName('MainBoard').active = false;
            this.UI.getChildByName('InitBoard').active = false;
            this.camera.node.getPosition(this._origin_camera_pos)
            this.Player.onJumpComplete = this.onJumpComplete.bind(this);
            this.Player.onJumpDead = this.onJumpDead.bind(this);
            this.Player._ground = this.curGround;
            this.nextGround = this.curGround;
            this._groundList.push(this.curGround);
        } else {
            console.log('初始化SDK失败,code:'+code);
        }

    }

    // 每次房间有数据变化会触发此方法,在此处进行UI更新
    roomUpdate() {

    }

    gameStart(){
        this.UI.getChildByName('StartBoard').active = false;
        this.UI.getChildByName('MatchingBoard').active = false;
        this.UI.getChildByName('MainBoard').active = true;
        this.createGround()
        this.State = GameStatus.RUNING;
        var temp_1 = new Quat();
        this.Player.node.getRotation(temp_1);
    }

    async gameMatching() {
        console.log('开始匹配:', gameInfo.openId)
        this.UI.getChildByName('StartBoard').active = false;
        this.UI.getChildByName('MatchingBoard').active = true;
        let code = await this.SDK.matching();
        if(code === 0) {
            console.log('匹配成功');
            this.UI.getChildByName('StartBoard').active = false;
            this.UI.getChildByName('MatchingBoard').active = false;
            this.UI.getChildByName('MainBoard').active = true;
        } else {
            console.log('匹配失败', code);
            this.UI.getChildByName('StartBoard').active = true;
            this.UI.getChildByName('MatchingBoard').active = false;
            this.UI.getChildByName('MainBoard').active = false;
        }

    }

    async gameMatchingCancel() {
        let code = await this.SDK.cancelMatchinig();

        if (code === 0) {
            console.log('取消匹配成功')
            this.UI.getChildByName('StartBoard').active = true;
            this.UI.getChildByName('MatchingBoard').active = false;
        } else {
            console.log('取消匹配失败')
        }
    }

    async getRoomInfo() {
        let info = await this.SDK.getRoomInfo();
        console.log('房间信息:', info);
    }
    
    reset (){
        for (let index = 0; index < this._groundList.length; index++) {
            let node = this._groundList.pop();
            node.destroy();
            
        }
        this.camera.node.setPosition(this._origin_camera_pos)
        this.Player.reset();
    }

    createGround() {
        this._score += 1;
        this.socreLabel.string = '积分:'+this._score;
        let cur_pos = new Vec3();
        let new_pos = new Vec3();

        this.nextGround.getPosition(cur_pos);
        Vec3.copy(new_pos, cur_pos)

        let dz = randomRange(this.randMin, this.randMax) * -1;

        if(randomRangeInt(1, 100) <= 50){

            new_pos.z += dz;
            new_pos.y = 5;

        }else{

            new_pos.x -= dz;
            new_pos.y = 5;
        }

        let newGround = instantiate(this.GroundPrfb)
        newGround.setPosition(new_pos);
        newGround.parent = this.Player.node.parent;
        new_pos.y = cur_pos.y;

        tween(newGround).to(0.3, {position: new_pos}).start()

        this._groundList.unshift(newGround);

        this.curGround = this.nextGround;
        this.Player._ground = this.curGround;
        this.Player._next_ground = newGround;
        this.nextGround = newGround;

        let camera_pos = new Vec3()
        Vec3.add(camera_pos, cur_pos, this._origin_camera_pos)

        tween(this.camera.node).to(0.5, {position: camera_pos}, { onComplete:this.createGround_End.bind(this)}).start();
        
    }
    createGround_End() {
        /* 每次创建一个方块后,将多余方块销毁,并将所有对象进行偏移,保证当前角色脚下的方块处在世界原点 */

        // 销毁所有超出视野范围的已通过方块对象
        if(this._groundList.length > this.maxGround){
            let node = this._groundList.pop();
            node.destroy();
        }

        // 获取跳跃结束后所有物体需要移动的偏移量
        let curPos = new Vec3()
        this.curGround.getPosition(curPos)
        let dx = curPos.x;
        let dz = curPos.z;

        // 队友当前显示出的所有方块进行同步偏移
        for (let index = 0; index < this._groundList.length; index++) {
            let node = this._groundList[index];
            let nodePos = new Vec3();
            node.getPosition(nodePos);
            nodePos.x -= dx;
            nodePos.z -= dz;
            node.setPosition(nodePos)
        }

        // 对另一队的角色位置进行同步偏移
        // let otherPlayerPos = new Vec3();
        // this.OtherTeam.getPosition(otherPlayerPos);
        // otherPlayerPos.x -= dx;
        // otherPlayerPos.z -= dz;
        // this.OtherTeam.setPosition(otherPlayerPos);

        // 对自己的角色位置进行同步偏移
        let playerPos = new Vec3()
        this.Player.node.getPosition(playerPos)
        playerPos.x -= dx;
        playerPos.z -= dz;
        this.Player.node.setPosition(playerPos)

        // 设置自己角色的面向方向
        var x = getRotaionQuat(this.Player.node, this.nextGround)

        // this.Player.node.setRotation(x)
        tween(this.Player.node).to(0.3, {rotation: x}, {onComplete:function(this){
            this.Player._control = true;
        }.bind(this)}).start();

        // 对主摄像机进行同步偏移
        this.curGround.getPosition(curPos)
        let camera_pos = new Vec3()
        Vec3.add(camera_pos, curPos, this._origin_camera_pos)
        this.camera.node.setPosition(camera_pos)
    }

    onJumpComplete(event){
        this.createGround();
        if(this.otherState != GameStatus.offline){
            // 此处调用SDK发送消息给队友,将队友的状态改为行动状态
            // this.State = GameStatus.WAIT;
        }
    }
    onJumpDead(event){
        if(this.otherState != GameStatus.offline){
            // 此处调用SDK发送消息给队友,将队友的状态改为行动状态
            // this.State = GameStatus.WAIT;
        }
    }

    update (dt: number) {

    }

}
