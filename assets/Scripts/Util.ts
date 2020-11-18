import { _decorator, Component, Node, Vec3, Vec2, Rect, Quat } from 'cc';
const { ccclass, property } = _decorator;

// 判断某一坐标点是否处于某个正方形内,l为边长,t_pos为正方形中心点
function posInRect(pos:Vec2, t_pos:Vec2, l:number){
    let t_rect = new Rect();
    let t_rect_p1 = new Vec2(t_pos.x - l, t_pos.y + l);
    let t_rect_p2 = new Vec2(t_pos.x + l, t_pos.y - l);
    Rect.fromMinMax(t_rect, t_rect_p1, t_rect_p2);

    return t_rect.contains(pos);
}

// 获取节点A到节点B方向的跳跃旋转轴
function getJumpAxis(A:Node, B:Node) {
    var A_pos = new Vec3();
    var B_pos = new Vec3();
    var axis = new Vec3(0, 0, 0);
    A.getPosition(A_pos);
    B.getPosition(B_pos);
    var a = A_pos.z - B_pos.z;
    var b = B_pos.x - A_pos.x;
    axis.set(-a, 0, -b);
    axis.normalize();
    return axis;
}

// 获取某节点A至目标节点B位置的Quat(水平平面,不考虑竖直方向)
function getRotaionQuat(A:Node, B:Node){
    var cur_pos = new Vec3();
    var tar_pos = new Vec3();
    var temp1 = new Vec2(0, 1);
    var temp2 = new Vec2();
    var temp3 = new Quat();
    temp3.lengthSqr()
    A.getPosition(cur_pos);
    B.getPosition(tar_pos);
    temp2.set(tar_pos.x-cur_pos.x, tar_pos.z - cur_pos.z);
    var ang = temp1.angle(temp2);
    console.log(tar_pos)
    console.log(cur_pos)
    console.log('ang:'+ang)
    Quat.rotateY(temp3, temp3, ang)
    return temp3;

}

// 获取某一坐标沿着向量V方向移动距离L后的新坐标
function getPosWithVec(pos:Vec3, V:Vec2, L:number) {
    V.normalize();
    V.multiplyScalar(L);
    var new_pos = new Vec3(pos.x+V.x, 0 , pos.z+V.y);
    return new_pos;
}



export {posInRect, getJumpAxis, getRotaionQuat, getPosWithVec}