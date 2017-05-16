import Canvas from '../Core/Canvas';
import ObjectManager from './ObjectManager';
import { Color } from './Color';
import Game from '../Core/Game';

class Block {
    public height: number = Canvas.Instance.Width / 7;
    public width: number = Canvas.Instance.Width / 7;
    public rotation: number = 0;
    public currentAnimationTime: number = 0;
    public remove: boolean = false;
    public shouldAnimate: boolean = false;
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

    private easeOutQuint = (currentTime: number, startValue: number, changeInValue: number, duration: number): number => {
        return changeInValue*((currentTime=currentTime/duration-1)*currentTime*currentTime*currentTime*currentTime + 1) + startValue;
    }

    public update(): void {
        if (this.isDownPlaceEmpty() && !this._manager.isAnimating)
        {
            this.y += 7.5;
        }
        if (this.shouldAnimate)
        {
            this.height = this.easeOutQuint(this.currentAnimationTime, this.height, -this.height, 8);
            this.width = this.easeOutQuint(this.currentAnimationTime, this.width, -this.width, 8);
            this.x = this.easeOutQuint(this.currentAnimationTime, this.x, this.width/2, 8);
            this.y = this.easeOutQuint(this.currentAnimationTime, this.y, this.height/2, 8);
            this.currentAnimationTime+=1.5*Game.dt;
            this.rotation+=0.1;
            if(this.currentAnimationTime >= 0.5) { this.shouldAnimate = false; this.remove = true}
        }
    }
}

export default Block;