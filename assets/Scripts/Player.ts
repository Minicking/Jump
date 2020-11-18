import { _decorator, Component, Vec3, systemEvent, SystemEvent, Animation, Node, EventKeyboard, macro, math, Quat, Enum, CCFloat, MeshRenderer, SkeletalAnimationComponent, Vec2, tween, EventTouch, EventAcceleration } from 'cc';
import { FaceStatus} from './Const'
import { posInRect, getJumpAxis, getRotaionQuat, getPosWithVec } from './Util'
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
    public max_time = 4;        //最大蓄力时间

    private _origin_y = 0;     //预设高度,由场景编辑时手动设置的高度自动进行赋值.用于角色复位

    private _cur_rotation = new Quat(); //当前角色稳定状态的旋转四元数
    private _cur_position = new Vec3(); //当前角色稳定状态的位置

    private _jump_time = 0;             //跳跃过程中的当前时刻
    private _distance = 0;              //此次跳跃的水平方向跳跃距离,根据蓄力时间计算得到
    private _powner_time = 0;           //此次跳跃的蓄力时间
    private _face = new Vec2();         //当前角色位置到下一个方块位置的方向向量
    private _axis = new Vec3();         //此次跳跃过程中旋转的旋转轴

    private _stat_power = false;         //是否处于蓄力状态
    private _stat_jump = false;          //是否处于跳跃状态

    public _ground: Node = null;        //当前脚下的方块对象
    public _next_ground: Node = null;   //下一个方块对象
    private _control = false;           //是否可以对角色进行控制

    public onJumpComplete: () => void; //发送跳跃完成事件
    public onJumpDead: () => void; //发送跳跃死亡事件
    public onDead: () => void; //死亡时触发GameManager的死亡事件
    
    set control(val){
        this._control = val;
    }

    get control(){
        return this._control;
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
        // this.node.getRotation(this._origin_rotation);
        this.node.getRotation(this._cur_rotation);
    }

    onTouchDown(event) {
        if(this.control){
            if(this._stat_power == false && this._stat_jump == false){
                this._distance = 0;
                this._stat_power = true;
                this._powner_time = 0;
                this._control = false;
            }
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
        if(this.control){
            if (event.keyCode == macro.KEY.space){
                if(this._stat_power == false && this._stat_jump == false){
                    this._distance = 0;
                    this._powner_time = 0;
                    this._stat_power = true;
                    this._control = false;
                }
            }else if (event.keyCode == macro.KEY.up){
    
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
            this.get_face(this._face);
            this._axis = getJumpAxis(this.node, this._next_ground);
            this.node.getRotation(this._cur_rotation);
            this.node.getPosition(this._cur_position);

            // 根据蓄力时间以及预设的公式计算此次跳跃的实际跳跃距离
            this._distance = 1*this._powner_time*this._powner_time + 1*this._powner_time;
        }
    }

    action_power (dt) {
        if(this._stat_power){
            if(this._powner_time < this.max_time){
                // let dt_distance = dt * this.add_rate;
                // this._distance += dt_distance;
                this._powner_time += dt;

                let PlayerPos = new Vec3();
                this.node.getPosition(PlayerPos);
                PlayerPos.y = this._origin_y - 0.272 * (this._powner_time / this.max_time);
                this.node.setPosition(PlayerPos);

                let groundScale = new Vec3();
                this._ground.getScale(groundScale);
                groundScale.y = 1 - this._powner_time / this.max_time * 0.5;
                this._ground.setScale(groundScale);

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
            
            // 跳跃旋转轴
            
            // 当前所在位置
            var cur_pos = new Vec3();

            this.node.getPosition(cur_pos);

            var new_pos = getPosWithVec(cur_pos, this._face,val);
            new_pos.y = y;

            Quat.rotateAround(tempQuat_1, this._cur_rotation, this._axis, roa*3.1415/180);

            this.node.setPosition(new_pos);
            this.node.setRotation(tempQuat_1);
            if(jump_end){
                this.action_jump_end()
            }

        }
    }

    get_face(out:Vec2) {
        this.node.getPosition(tempVec_1);
        this._next_ground.getPosition(tempVec_2);
        out.set(tempVec_2.x - tempVec_1.x, tempVec_2.z - tempVec_1.z);

    }

    action_jump_end(){

        let cur_ground_pos = new Vec3()
        let next_ground_pos = new Vec3()
        let cur_pos = new Vec3()
        this._ground.getPosition(cur_ground_pos)
        this._next_ground.getPosition(next_ground_pos)
        this.node.getPosition(cur_pos)

        if(posInRect(new Vec2(cur_pos.x, cur_pos.z), new Vec2(cur_ground_pos.x, cur_ground_pos.z), 0.5)){

            this._control = true;
        }else if(posInRect(new Vec2(cur_pos.x, cur_pos.z), new Vec2(next_ground_pos.x, next_ground_pos.z), .5)){
            if(this.onJumpComplete){
                this.node.getPosition(this._cur_position)
                this.onJumpComplete();
            }
        }else{
            let dead_pos = new Vec3()
            dead_pos.set(cur_pos)
            dead_pos.y = -0.5
            tween(this.node).to(1, {position: dead_pos}, {onComplete:this.reset.bind(this)}).start();

        }

    }
    reset(){
        // let cur_ground_pos = new Vec3();
        // this._ground.getPosition(cur_ground_pos);
        // let pos = new Vec3(cur_ground_pos.x, this._origin_y, cur_ground_pos.z);
        this.node.setPosition(this._cur_position);
        this.onJumpDead();
        this._control = true;
    }

    update (deltaTime: number) {
        
        this.action_power(deltaTime);

        this.action_jump(deltaTime);

        

    }


}
