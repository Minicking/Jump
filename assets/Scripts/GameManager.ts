import { _decorator, Component, Node, Prefab, Vec3, deserialize, random, randomRange, instantiate, GFXSamplerState, Game, Camera, NodePool, tween, randomRangeInt, Canvas, LabelComponent, CCInteger } from 'cc';
import { Player } from './Player'
import { GameStatus, FaceStatus} from './Const'

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
    //角色的预制件
    @property({type: Prefab})
    public playerPrfb: Prefab = null;

    //方块的预制件
    @property({type: Prefab})
    public GroundPrfb: Prefab = null;

    //玩家控制的角色对象
    @property({type: Player})
    public Player: Player = null;

    //当前踩着的方块对象
    @property({type: Node})
    public curGround: Node = null;

    //游戏中所使用的摄像头
    @property({type: Camera})
    public camera: Camera = null;

    //积分label
    @property({type: LabelComponent})
    public socreLabel: LabelComponent = null;

    //最大的方块存留数,多余的地块会被销毁
    @property({type: CCInteger})
    public maxGround: Number = 6;

    //下一个方块对象
    private nextGround: Node = null;

    //当前游戏的运行状态
    private _curState: GameStatus = GameStatus.INIT;

    //队友游戏运行状态
    private _otherState: GameStatus = GameStatus.INIT;

    //游戏过程中的方块列表
    private _groundList: Node[] = [];

    //编辑器中手动放置的摄像机预设位置
    private _origin_camera_pos = new Vec3();


    private _score = -1;

    set curState(stat: GameStatus){
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

    // todo 帧同步监听 游戏状态切换在此处根据同步信息进行切换
    // listen

    start (){
        this.camera.node.getPosition(this._origin_camera_pos)
        this.Player.onJumpComplete = this.onJumpComplete.bind(this);
        this.Player.onJumpDead = this.onJumpDead.bind(this);
        this.Player._ground = this.curGround;
        this.nextGround = this.curGround;
        this._groundList.push(this.curGround);
        this.createGround()
        // this.gameStart();
    }

    gameStart(){
        this.curState = GameStatus.RUNING;
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

        let dz = randomRange(2, 4) * -1;

        if(randomRangeInt(1, 100) <= 50){
            if(this.Player.stat_face == FaceStatus.RU){
                this.Player.stat_face = FaceStatus.LU;
            }
            new_pos.z += dz;
            new_pos.y = 5;
        }else{
            if(this.Player.stat_face == FaceStatus.LU){
                this.Player.stat_face = FaceStatus.RU;
            }
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
        if(this._groundList.length > this.maxGround){
            let node = this._groundList.pop();
            node.destroy();
        
            
        }
        let curPos = new Vec3()
        this.curGround.getPosition(curPos)
        let dx = curPos.x;
        let dz = curPos.z;
        for (let index = 0; index < this._groundList.length; index++) {
            let node = this._groundList[index];
            let nodePos = new Vec3();
            node.getPosition(nodePos);
            nodePos.x -= dx;
            nodePos.z -= dz;
            node.setPosition(nodePos)
        }
        let playerPos = new Vec3()
        this.Player.node.getPosition(playerPos)
        playerPos.x -= dx;
        playerPos.z -= dz;
        this.Player.node.setPosition(playerPos)
        this.curGround.getPosition(curPos)
        let camera_pos = new Vec3()
        Vec3.add(camera_pos, curPos, this._origin_camera_pos)
        this.camera.node.setPosition(camera_pos)
    }

    onJumpComplete(event){
        this.createGround();
        if(this._otherState != GameStatus.offline){
            // 此处调用SDK发送消息给队友,将队友的状态改为行动状态
            this.curState = GameStatus.WAIT;
        }
    }
    onJumpDead(event){
        if(this._otherState != GameStatus.offline){
            // 此处调用SDK发送消息给队友,将队友的状态改为行动状态
            this.curState = GameStatus.WAIT;
        }
    }

    update (dt: number) {

    }

}
