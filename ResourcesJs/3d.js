import {ClaicyTrait, ClaicyObject} from '../claicy.js';
import { IColor } from './client.js'

/**interface IVector3 {
    var x: number;
    var y: number;
    var z: number;}*/
export class IVector3 extends ClaicyTrait {
    constructor() {
        super();
        this.addTrait('x', Number);
        this.addTrait('y', Number);
        this.addTrait('z', Number);
    }
}

/**interface IOrientator extends IVector3 {
    var rotation: Vector3;}*/
export class IOrientator extends IVector3 {
    constructor() {
        super();
        this.addTrait('rotation', IVector3);
    }
}

/**interface BaseBody extends SpacedThing {
    var nofall: boolean;
    var linearVelocity: IVector3;
    var color: IColor;
    var orientator: IOrientator;
    var mass: number;
    var size: IVector3;}*/
export class BaseBody extends ClaicyTrait {
    constructor() {
        super();
        this.addTrait('nofall', Boolean);
        this.addTrait('linearVelocity', IVector3);
        this.addTrait('color', IColor);
        this.addTrait('orientator', IOrientator);
        this.addTrait('mass', Number);
        this.addTrait('size', IVector3);
    }
}