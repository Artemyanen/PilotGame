import * as _ from 'underscore';
import Block from './Block';
import Canvas from '../Core/Canvas';
import Game from '../Core/Game';
import { Color } from './Color';

class ObjectManager {
    private _gameObjects: Block[] = [];
    private static _instance: ObjectManager;
    private _myCanvas: Canvas;
    public isMoving : boolean = false;
    public isAnimating : boolean = false;
    private _startLinesCount : number = 2;
    private _blocksPerRowCount : number = 4;
    private _colors: Color[] = [
        new Color('#ff9e9d', '#d57f88'),
        new Color('#f4eea6', '#ccc08f'),
        new Color('#3fb8af', '#359497'),
        new Color('#ff3d7f', '#d5316e')
    ];

    static get Instance(): ObjectManager {
        if (ObjectManager._instance == null)
            ObjectManager._instance = new ObjectManager();
        return ObjectManager._instance;
    }

    private constructor() {
        this._myCanvas = Canvas.Instance;
    }

    public get GameObjects(): Block[] { return this._gameObjects }
    public set GameObjects(gameObjects) { this._gameObjects = gameObjects }

    private getRandomColor = (): Color => {
        let random = Math.floor(Math.random() * this._colors.length);
        return this._colors[random];
    }

    private sortObjects(a: Block, b: Block): number {
        return a.x == b.x && a.y == b.y && a.color.normal == b.color.normal ? 1 : 0;
    }

    private rowCountMatch(block: Block, blocksInRowCount: number, direction: Direction): boolean {
        return new Array(blocksInRowCount)
            .fill('x')
            .filter((_, ind) => {
                let x = direction == Direction.Horizontal ? block.x + (ind * block.width) : block.x;
                let y = direction == Direction.Vertical ? block.y + (ind * block.height) : block.y;
                let obj = this.getObjectIn(x, y);
                return (obj && obj.color.normal == block.color.normal);
            }).length == blocksInRowCount;
    }

    private timeout = async (wait: number): Promise<void> => new Promise<void>((res) => setTimeout(res, wait));

    public createStartLines(): void {
        new Array(this._startLinesCount).fill(0).forEach(() => {
            this.createNewLine();
            this.upOldLines();
        })
    }

    public createNewLine(): void {
        const size = Canvas.Instance.Width / 7;
        while (true) {
            let lineObjects = new Array(this._blocksPerRowCount)
                .fill(0)
                .map((val, ind) => new Block(size * (ind + 1.5), this._myCanvas.Height, this.getRandomColor()))
            let result = _.chain(lineObjects)
                .groupBy(block => block.color.normal)
                .map(block => block.length)
                .filter(block => block > 2)
                .value().length == 0;

            if (result == false)
                continue;

            this._gameObjects = this._gameObjects.concat(lineObjects);
            
            break;
        }
    }

    public upOldLines(): void {
        this._gameObjects.forEach((block) => block.y -= Canvas.Instance.Width / 7);
    }

    public bfs(startBlock: Block): Block[] {
        let checked: Block[] = [];
        let queue: Block[] = [];
        queue.push(startBlock);
        checked.push(startBlock);
        while (queue.length) {
            let current = queue.shift();
            current
                .getNeightbours()
                .filter(neigh => neigh.color.normal == current.color.normal)
                .forEach(neigh => {
                    if (checked.indexOf(neigh) == -1) {
                        queue.push(neigh);
                        checked.push(neigh);
                    }
                });
        }
        return checked;
    };

    public isTripleAvailable(): Block[][] {
        return _.chain(this._gameObjects)
            .filter(val => val.remove == false)
            .map(val => this.bfs(val))
            .filter(q => q.length > 2 &&
                (this.rowCountMatch(q[0], 3, Direction.Horizontal) || this.rowCountMatch(q[0], 3, Direction.Vertical)))
            .map(val => _.chain(val).sortBy(q => q.x).sortBy(q => q.y).value())
            .groupBy(q => q[0].x + "|" + q[0].y)
            .map(q => q[0])
            .value();
    }

    public getObjectsIn(x: number, y: number): Block[] {
        return this._gameObjects.filter((object) => (y >= object.y && y < object.y + object.height
            && x >= object.x && x < object.x + object.width));
    }
    public getObjectIn(x: number, y: number): Block {return this.getObjectsIn(x,y)[0];}

    public waitForFalling = async (): Promise<boolean> => {
        while (true) {
            await this.timeout(100);
            if (this.isMoving == false)
                return true;
        }
    }

    public waitForAnimation = async (): Promise<boolean> => {
        while (true) {
            await this.timeout(1000);
            if (this.isAnimating == false)
                return true;
        }
    }
}

enum Direction {
    Vertical,
    Horizontal
}

export default ObjectManager;