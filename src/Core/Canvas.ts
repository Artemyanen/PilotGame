class Canvas {
    private static _instance: Canvas;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;

    static get Instance(): Canvas {
        if (Canvas._instance == null)
            Canvas._instance = new Canvas(490, 640);
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


    public drawBackground(): void {
        this._context.fillStyle = '#806895';
        this._context.fillRect(0, 0, this._width, this._height);
    }

    public drawSideColumn(): void {
        this._context.fillStyle = '#60427a';
        this._context.fillRect((this._width/7)*1.5, 0, this._width - (this._width/7)*3, this._height);
    }

    public drawBlock({ object }): void {
        this._context.fillStyle = object.color;
        this._context.fillRect(object.x, object.y, object.height, object.width);
    }

    public clearWindow(): void {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
}

export default Canvas;