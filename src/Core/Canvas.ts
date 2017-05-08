import Block from '../Objects/Block';
import Game from './Game';

class Canvas {
    private shouldShake: boolean = false;
    private shakeTime: number = 0;
    private shakeDuration: number = 0.5;
    private static _instance: Canvas;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private dx: number = 0;
    private dy: number = 0;

    static get Instance(): Canvas {
        if (Canvas._instance == null)
            Canvas._instance = new Canvas(420, 660);
        return Canvas._instance;
    }

    private constructor(width: number, height: number) {
        this.initCanvas(width, height);
    }

    private initCanvas(width: number, height: number) {
        this._height = height;
        this._width = width;
        document.body.innerHTML = `<canvas id='canvas' width='${this._width}' height='${this._height}' />`;
        this._canvas = (<HTMLCanvasElement>document.getElementById("canvas"));
        this._context = this._canvas.getContext("2d");
    }

    public get Width(): number { return this._width }
    public get Height(): number { return this._height }
    public get Canvas(): HTMLCanvasElement { return this._canvas }
    public get Context(): CanvasRenderingContext2D { return this._context }

    public StartShaking(): void {
        this.shouldShake = true;
        this.shakeTime = 0;
    }


    public drawBackground(): void {
        this._context.fillStyle = '#806895';
        this._context.fillRect(0, 0, this._width, this._height);
    }

    public drawSideColumn(): void {
        this._context.fillStyle = '#60427a';
        this._context.fillRect((this._width / 7) * 1.5, 0, this._width - (this._width / 7) * 3, this._height);
    }

    public drawGameOverLine(): void {
        this._context.setLineDash([38, 10]);
        this._context.beginPath();
        this._context.moveTo(((this._width / 7) * 1.5)-20, this._height/11);
        this._context.lineTo(this._width - (this._width / 7)* 1.5, this._height/11);
        this._context.lineWidth = 10;
        this._context.strokeStyle = '#806895';
        this._context.stroke();
        this._context.closePath();
    }

    public drawBlock(object: Block): void {
        this._context.fillStyle = object.color.normal;
        this._context.setTransform(1, 0, 0, 1, object.x+object.width / 2, object.y+object.height / 2);
        this._context.rotate(object.rotation);
        this._context.fillRect((-object.width / 2)+this.dx, (-object.height / 2)+this.dy, object.width, object.height);  
        if (object.ShouldHaveBorder && !object.shouldAnimate) {
            this._context.fillStyle = object.color.shadow;
            this._context.fillRect(
                (-object.width / 2)+this.dx, 
                ((-object.height/2)+object.height/10*9)+this.dy, 
                object.width, 
                object.height / 10);
        }
    }

    public preShake(): void {
        if(this.shakeTime > this.shakeDuration || !this.shouldShake)
            return;
        this.shakeTime += Game.dt;
        this._context.save();
        this.dx = Math.random()*5;
        this.dy = Math.random()*5;
        this._context.translate(this.dx, this.dy);    
    }


    public postShake(): void {
        if (this.shakeTime > this.shakeDuration || !this.shouldShake) {
            this.shouldShake = false;
            this.dx = 0;
            this.dy = 0;
            return;
        }
        this._context.restore();
    }

    public clearWindow(): void {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
}

export default Canvas;