import Canvas from '../Core/Canvas';
import ObjectManager from './ObjectManager';
import {Color} from './Color';

class Block implements IObject {
    public x: number;
    public y: number;
    public color: Color;
    public height: number = Canvas.Instance.Width/7;
    public width: number = Canvas.Instance.Width/7;
    public remove: boolean;
    private _manager: ObjectManager = ObjectManager.Instance;
    private _canvas: Canvas = Canvas.Instance;

    constructor(x:number, y:number, color:Color) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.remove = false;
    }
    public get ShouldHaveBorder(): boolean {
        const downNeighbour = this._manager.getObjectsIn(this.x, this.y + this.height)[0];
        return (downNeighbour && this.color != downNeighbour.color ||
            this.y == this._canvas.Height - this.height);
    }

    public getNeightbours(): Block[] {
        const x = this.x;
        const y = this.y;
        const size = this.height;
        return [
            this._manager.getObjectsIn(x, y - size)[0],
            this._manager.getObjectsIn(x, y + size)[0],
            this._manager.getObjectsIn(x - size, y)[0],
            this._manager.getObjectsIn(x + size, y)[0]].filter(q => q);
    }

    public isDownPlaceEmpty(): boolean {
        return (this._manager.getObjectsIn(this.x, this.y + this.height)[0] == undefined &&
            this.y < this._canvas.Height - this.height)
    }

    public update(): void {
        if (this.isDownPlaceEmpty())
            this.y += this.height/8;
    }
}

interface IObject {
    x: number,
    y: number,
    color: Color
}

export default Block;