import Block from '../Objects/Block';
import Canvas from './Canvas';
import ObjectManager from '../Objects/ObjectManager';

class Game {
    public static dt: number;
    private _myCanvas: Canvas  = Canvas.Instance;
    private _manager: ObjectManager = ObjectManager.Instance;
    private _lastTime: number = 0;

    constructor() {
        this._manager.createStartLines();
        this.initEventListener();
    }

    private get CanvasLeftOffset(): number{return this._myCanvas.Canvas.offsetLeft;}
    private get CanvasToptOffset(): number{return this._myCanvas.Canvas.offsetTop;}

    private initEventListener() {
        document.addEventListener('click', this.gameProcessController);
    }

    private gameProcessController = async (event: MouseEvent) => {
        const x = event.pageX - this.CanvasLeftOffset;
        const y = event.pageY - this.CanvasToptOffset;

        const clickedObject = this._manager.getObjectIn(x, y);
        
        if (!clickedObject || this._manager.isMoving || this._manager.isAnimating)
        {
            return;
        }
            
        const sameColors = this._manager.bfs(clickedObject);
        sameColors.forEach((val, ind) => {val.shouldAnimate = true});
        this._manager.createNewLine();
        this._manager.upOldLines();
        while (true) {
            await this._manager.waitForFalling();
            const triples = this._manager.isTripleAvailable();
            if (triples.length == 0)
                break;
            triples.forEach(val => val.forEach(q => q.shouldAnimate = true));
        }
        if (this._manager.GameObjects.length == 0)
            this._manager.createNewLine();

        if (this._manager.GameObjects.some(q => q.y < 0 + 2*q.height)) 
            this.changeGameController(this.gameOverController, this.gameProcessController);
    }

    private gameOverController = (): void => {
        this._manager.GameObjects.forEach(q => q.remove = true);
        this._manager.createStartLines();

        this.changeGameController(this.gameProcessController, this.gameOverController);
    }
    
    private changeGameController(on: EventListenerOrEventListenerObject, off: EventListenerOrEventListenerObject): void {
        document.removeEventListener('click', off);
        document.addEventListener('click', on);
    }

    private pulse = (millis): void => {
        if (this._lastTime != null && this._lastTime) {
            Game.dt = ((millis - this._lastTime) / 1000);
            this.update();
        }
        this._lastTime = millis;
        window.requestAnimationFrame(this.pulse);
    }

    private update(): void {
        this._manager.GameObjects = this._manager.GameObjects.filter(q => q.remove == false);
        this._manager.isAnimating = this._manager.GameObjects.filter(object => object.shouldAnimate).length > 0;
        this._manager.isMoving = this._manager.GameObjects.filter(object => object.isDownPlaceEmpty()).length > 0;
        this._manager.GameObjects.forEach(object => object.update());

        this._myCanvas.clearWindow();
        this._myCanvas.drawBackground();
        this._myCanvas.drawSideColumn();

        this._myCanvas.drawGameOverLine();

        this._manager.GameObjects.forEach((object) => {
            this._myCanvas.drawBlock(object);
        });

        this._myCanvas.Context.setTransform(1, 0 ,0 , 1, 0, 0);
    }

    public start(): void {
        this.pulse(null);
    }
}

export default Game;