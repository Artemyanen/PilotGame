import Canvas from '../Core/Canvas';
import ObjectManager from './ObjectManager';
import { Color } from './Color';
import Game from '../Core/Game';

class Block {
    public height: number = Canvas.Instance.Width / 7;
    public width: number = Canvas.Instance.Width / 7;
    public remove: boolean = false;
    private _manager: ObjectManager = ObjectManager.Instance;
    private _canvas: Canvas = Canvas.Instance;

    constructor(public x: number,public  y: number,public color: Color) {}

    public get ShouldHaveBorder(): boolean {
        const downNeighbour = this._manager.getObjectIn(this.x, this.y + this.height);
        return (downNeighbour && this.color != downNeighbour.color ||
            this.y == this._canvas.Height - this.height);
    }

    public getNeightbours(): Block[] {
        const x = this.x;
        const y = this.y;
        const size = this.height;
        return [
                this._manager.getObjectIn(x, y - size),
                this._manager.getObjectIn(x, y + size),
                this._manager.getObjectIn(x - size, y),
                this._manager.getObjectIn(x + size, y)
            ].filter(q => q);
    }

    public isDownPlaceEmpty(): boolean {
        return (this._manager.getObjectIn(this.x, this.y + this.height) == undefined &&
            this.y < this._canvas.Height - this.height)
    }

    public update(): void {
        if (this.isDownPlaceEmpty())
        {
            this.y += Math.floor(this.height * Game.dt ) * 6;
        }
    }
}

export default Block;