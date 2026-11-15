import {ClaicyTrait, ClaicyObject} from '../claicy.js';

/**interface IColor {
    var r: number;
    var g: number;
    var b: number;
}*/
export class IColor extends ClaicyTrait {
    constructor() {
        super();
        this.addTrait('r', Number);
        this.addTrait('g', Number);
        this.addTrait('b', Number);
    }
}