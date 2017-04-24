import Block from '../Objects/Block';
import Canvas from './Canvas';
import ObjectManager from '../Objects/ObjectManager';

class Game {
    public static dt: number;
    private _myCanvas: Canvas;
    private _manager: ObjectManager;
    private _lastTime: number = 0;
    private _canvasLeftOffset: number;
    private _canvasToptOffset: number;

    constructor() {
        this._myCanvas = Canvas.Instance;
        this._manager = ObjectManager.Instance;
        this._canvasLeftOffset = this._myCanvas.Canvas.offsetLeft;
        this._canvasToptOffset = this._myCanvas.Canvas.offsetTop;

        this._manager.createStartLines();
        this.initEventListener();
    }

    private initEventListener() {
        document.addEventListener('click', async (event) => {
            const x = event.pageX - this._canvasLeftOffset;
            const y = event.pageY - this._canvasToptOffset;

            const clickedObject = this._manager.getObjectsIn(x, y)[0];
            if (!clickedObject || this._manager._isMoving)
                return;
            const sameColors = this._manager.bfs(clickedObject);
            sameColors.forEach((val, ind) => val.remove = true);
            this._manager.createNewLine();
            this._manager.upOldLines();
            while (true) {
                await this._manager.waitForFalling();
                const triples = this._manager.isTripleAvailable();
                if (triples.length == 0)
                    break;
                triples.forEach(val => val.forEach(q => q.remove = true));
            }
            if (this._manager.GameObjects.length == 0)
                this._manager.createNewLine();
        });
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
        this._manager._isMoving = this._manager.GameObjects.filter(object => object.isDownPlaceEmpty()).length > 0;
        this._manager.GameObjects.forEach(object => object.update());

        // gameObjects.some(q=>q.y ==0)
        this._myCanvas.clearWindow();
        this._myCanvas.drawBackground();
        this._myCanvas.drawSideColumn();

        this._manager.GameObjects.forEach((object) => {
            this._myCanvas.drawBlock(object);
            
        });
    }
 
    public start(): void {
        this.pulse(null);
    }
}

export default Game;