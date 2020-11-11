import { _decorator, Component, Vec3, systemEvent, SystemEvent, Animation, Node, EventKeyboard, macro, math, Quat, Enum, CCFloat, MeshRenderer, SkeletalAnimationComponent, Vec2, tween, EventTouch, EventAcceleration } from 'cc';
import { FaceStatus} from './Const'
import { posInRange } from './Util'
const { ccclass, property } = _decorator;




const tempVec_1 = new Vec3();
const tempVec_2 = new Vec3();
const tempQuat_1 = new Quat();
const tempQuat_2 = new Quat();



@ccclass('Player')
export class Player extends Component {

    @property({type: CCFloat})
    public jumpHeight: number = 2;    //跳跃高度
    
    @property({type: CCFloat})
    public jumpDuration: number = 0.7;    //跳跃持续时间
    
    @property({type: CCFloat})
    public add_rate = 3;            //跳跃距离增长速率,每秒水平方向移动距离增加量
    
    @property({type: CCFloat})
    public max_distance = 4;        //最大跳跃距离
    
    private _origin_y = 0;
    private _origin_rotation = new Quat();
    private _cur_rotation = new Quat();
    private _jump_time = 0;
    private _distance = 0;              //水平方向跳跃距离
    private _stat_face = FaceStatus.LU;     //移动面向方位
    private _stat_power = false;         //是否处于蓄力状态
    private _stat_jump = false;          //是否处于跳跃状态
    public _ground: Node = null;
    public _next_ground: Node = null

    public onNext: () => void; //用来触发GamaManager中的地面方块创建事件

    public onDead: () => void; //死亡时触发GameManager的死亡事件
    
    set stat_face(val){
        let temp_quat = new Quat();

        switch (val) {
            case FaceStatus.LU:
                this._stat_face = FaceStatus.LU;
                this.node.setRotation(this._origin_rotation);
                this._cur_rotation.set(this._origin_rotation);
                break;
            
            case FaceStatus.RU:
                this._stat_face = FaceStatus.RU;
                Quat.rotateY(temp_quat, this._origin_rotation, 90*180/3.1415926);
                this.node.setRotation(temp_quat);
                this._cur_rotation.set(temp_quat);
                break;

            default:
                break;
        }
    }

    get stat_face(){
        return this._stat_face;
    }


    onLoad() {
        this.node.getRotation(tempQuat_1)
    }

    start () {
        // Your initialization goes here.
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchDown, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchUp, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this._origin_y = this.node.position.y;
        this.node.getRotation(this._origin_rotation);
        this.node.getRotation(this._cur_rotation);

    }

    onTouchDown(event) {
        console.log('touch:')
        console.log(event.getLocation())
        console.log(event)
        if(this._stat_power == false && this._stat_jump == false){
            this._distance = 0;
            this._stat_power = true;
        }
    }

    onTouchUp(event) {
        if(this._stat_power){

            this._stat_power = false;
            this._ground.setScale(new Vec3(1, 1, 1));

            let PlayerPos = new Vec3();
            this.node.getPosition(PlayerPos);
            PlayerPos.y = this._origin_y;
            this.node.setPosition(PlayerPos);

            this.start_jump();
        }
    }

    onKeyDown(event: EventKeyboard){
        if (event.keyCode == macro.KEY.space){
            if(this._stat_power == false && this._stat_jump == false){
                this._distance = 0;
                this._stat_power = true;
            }
        }else if (event.keyCode == macro.KEY.up){
            
            if (this._stat_face == FaceStatus.LU){
                this._stat_face= FaceStatus.RB;
                
            }else{
                this._stat_face= FaceStatus.LU;
                
            }

        }
    }

    onKeyUp(event: EventKeyboard){
        
        if (event.keyCode == macro.KEY.space){
            if(this._stat_power){

                this._stat_power = false;
                this._ground.setScale(new Vec3(1, 1, 1));

                let PlayerPos = new Vec3();
                this.node.getPosition(PlayerPos);
                PlayerPos.y = this._origin_y;
                this.node.setPosition(PlayerPos);

                this.start_jump();
            }
        }
    }

    start_jump(){
        if(!this._stat_power){
            this._stat_jump = true;
            this._jump_time = 0;
        }
    }

    action_power (dt) {
        if(this._stat_power){
            if(this._distance < this.max_distance){
                let dt_distance = dt * this.add_rate;
                this._distance += dt_distance;

                let PlayerPos = new Vec3();
                this.node.getPosition(PlayerPos);
                PlayerPos.y = this._origin_y - 0.272 * (this._distance / this.max_distance);
                this.node.setPosition(PlayerPos);

                let groundScale = new Vec3();
                this._ground.getScale(groundScale);
                groundScale.y = 1 - this._distance / this.max_distance * 0.5;
                this._ground.setScale(groundScale);


                
                // this.node.getScale(tempVec_1);
                // tempVec_1.y -= 0.002;
                // this.node.setScale(tempVec_1);
            }

        }
    }

    action_jump(dt){
        if(this._stat_jump){
            this._jump_time += dt;
            let y = 0;
            let val = 0;
            let roa = 0;
            let jump_end = false;
            if (this._jump_time < this.jumpDuration){
                let a = -4*this.jumpHeight/(this.jumpDuration*this.jumpDuration);
                let h = this.jumpDuration/2;
                let k = this.jumpHeight;
                y = a*(this._jump_time - h)*(this._jump_time - h) + k + this._origin_y;
                val = (dt/this.jumpDuration) * this._distance;
                roa = (this._jump_time/this.jumpDuration) * 360;
            }else{
                y = this._origin_y;
                roa = 0;
                this._stat_jump = false;
                jump_end = true;

            }
            this.node.getPosition(tempVec_1);
            let tp = new Quat();
            // Quat.copy(tp, this._origin_rotation);

            tempVec_1.y = y;
            
            let face_r = new Vec3(0, 0, 0);
            if(this._stat_face == FaceStatus.LU){
                face_r.x = -1;
                tempVec_1.z -= val;
            }else if(this._stat_face == FaceStatus.RU){
                face_r.z = -1;
                tempVec_1.x += val;
            }else if(this._stat_face == FaceStatus.RB){
                face_r.x = 1;
                tempVec_1.z += val;
            }else if(this._stat_face == FaceStatus.LB){
                face_r.z = 1;
                tempVec_1.x -= val;
            }
            Quat.rotateAround(tp, this._cur_rotation, face_r, roa*3.1415/180);

            this.node.setPosition(tempVec_1);
            this.node.setRotation(tp);
            if(jump_end){
                this.action_jump_end()
            }

        }
    }

    action_jump_end(){

        let cur_ground_pos = new Vec3()
        let next_ground_pos = new Vec3()
        let cur_pos = new Vec3()
        this._ground.getPosition(cur_ground_pos)
        this._next_ground.getPosition(next_ground_pos)
        this.node.getPosition(cur_pos)
        console.log()
        if(posInRange(new Vec2(cur_pos.x, cur_pos.z), new Vec2(cur_ground_pos.x, cur_ground_pos.z), 0.5)){
            console.log('no jump over')
        }else if(posInRange(new Vec2(cur_pos.x, cur_pos.z), new Vec2(next_ground_pos.x, next_ground_pos.z), .5)){
            if(this.onNext){
                this.onNext();
            }
        }else{
            console.log('dead!')

            let dead_pos = new Vec3()
            dead_pos.set(cur_pos)
            dead_pos.y = -0.5
            tween(this.node).to(1, {position: dead_pos}, {onComplete:this.reset.bind(this)}).start();

        }

    }
    reset(){
        let cur_ground_pos = new Vec3();
        this._ground.getPosition(cur_ground_pos);
        let pos = new Vec3(cur_ground_pos.x, this._origin_y, cur_ground_pos.z);
        this.node.setPosition(pos);
    }

    update (deltaTime: number) {
        
        this.action_power(deltaTime);

        this.action_jump(deltaTime);

        

    }


}
