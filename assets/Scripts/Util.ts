import { _decorator, Component, Node, Vec3, Vec2, Rect } from 'cc';
const { ccclass, property } = _decorator;

function posInRange(pos:Vec2, t_pos:Vec2, range:number){
    let t_rect = new Rect();
    let t_rect_p1 = new Vec2(t_pos.x - range, t_pos.y + range);
    let t_rect_p2 = new Vec2(t_pos.x + range, t_pos.y - range);
    Rect.fromMinMax(t_rect, t_rect_p1, t_rect_p2);

    return t_rect.contains(pos);
}

export {posInRange}