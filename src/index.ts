import * as _ from 'underscore';

interface IObject
{
    x:number,
    y:number,
    color:string
}

class Block implements IObject
{
    x: number;
    y: number;
    color:string;
    height:number = 64;
    width:number = 64;
    neigh = [];
    remove:boolean;

    constructor(x, y, color)
    {
        this.color = color;
        this.x = x;
        this.y = y;
        this.remove = false;
    }

    getNeightbours()
    {
        const x = this.x;
        const y = this.y;
        return [
            getObjectsIn(x,y-64)[0],
            getObjectsIn(x,y+64)[0],
            getObjectsIn(x-64,y)[0],
            getObjectsIn(x+64,y)[0]].filter(q=>q);
    }
    isDownPlaceEmpty()
    {
        if(getObjectsIn(this.x,this.y+64)[0] == undefined && this.y < canvas.height-this.height)
            return true
        return false;
    }

    update()
    {
        if(this.isDownPlaceEmpty())
            this.y += 16;
    }

}

const canvas = document.getElementById('MyCanvas');
const context = canvas.getContext('2d');

let dt:number;
let lastTime:number = 0;
let gameObjects:Block[] = [];

const pulse = (millis):void => {
    if(lastTime!=null && lastTime)
        {
            dt = ((millis - lastTime) / 1000);
            update();
        }
    lastTime = millis;
    window.requestAnimationFrame(pulse);
}


const update = () => {
    gameObjects = gameObjects.filter(q=>q.remove == false);

    gameObjects.forEach(object=>object.update());

    context.clearRect(0,0,canvas.width,canvas.height);
    gameObjects.forEach((object,ind)=>{
        context.fillStyle = object.color;
        context.fillRect(object.x, object.y, object.height, object.width);
    });
}

const getRandomColor = ():string =>
{
    const colors = ['red','green','blue'];
    let random = Math.floor(Math.random()*3);
    return colors[random];
}

const createNewLine = () => {
    const size = 64;
    let y = canvas.height;
    for(let _i = 0; _i < 4; _i++)
        gameObjects.push(new Block(size*_i, y, getRandomColor()));
}

const upOldLines = () => {
    gameObjects.forEach((block)=>{
        block.y -= 64;
    });
}

const bfs = (startBlock:Block) => 
{
    let checked :Block[]= [];
    let queue :Block[]= [];
    let current :Block;
    queue.push(startBlock);
    checked.push(startBlock);
    while (queue.length) {
        current = queue.shift();
        current
            .getNeightbours()
            .filter(neigh=>neigh.color == current.color)
            .forEach(neigh=>{
                if(checked.indexOf(neigh) == -1) 
                {
                    queue.push(neigh);
                    checked.push(neigh);
                }
            });
    }
    return checked;
};

const isTripleAvailable = (objects:Block[]) =>
{
    return _.chain(objects)
    .filter(val=>val.remove==false)
    .map(val=> bfs(val))
    .filter(q=>q.length > 2 && (rowCountMatch(q[0],3,Direction.Horizontal) || rowCountMatch(q[0],3,Direction.Vertical)))
    .map(val=>_.chain(val).sortBy(q=>q.x).sortBy(q=>q.y).value())
    .groupBy(q=>q[0].x + "|" +q[0].y).map(q=>q[0]).value().length > 0;
}

const sortObjects = (a:Block,b:Block) : number=>
{
    return a.x == b.x && a.y == b.y && a.color == b.color ? 1 :0;
}

const rowCountMatch = (block:Block,blocksInRowCount:number,direction:Direction) =>
{
    let result:Block[] = [];
    new Array(blocksInRowCount)
    .fill('x')
    .forEach((_,ind)=>
    {
        let obj : Block;
        if(direction == Direction.Horizontal)
            obj = getObjectsIn(block.x+(ind*block.width),block.y)[0];
        else
            obj = getObjectsIn(block.x,block.y+(ind*block.height))[0];
        if(obj && obj.color == block.color)
            result.push(obj);
        else
            return false;
    });
    return result.length == blocksInRowCount;
}

enum Direction
{
    Vertical,
    Horizontal
}

const getObjectsIn = (x:number,y:number) =>
{
    return gameObjects.filter((object)=>(y >= object.y && y < object.y + object.height
        && x >= object.x && x < object.x + object.width));
}

// let canClick = true;
let canvasLeftOffset = canvas.offsetLeft;
let canvasToptOffset = canvas.offsetTop;
document.addEventListener('click', (event)=>{
    const x = event.pageX - canvasLeftOffset;
    const y = event.pageY - canvasToptOffset;
    // if(canClick == false)
    //     return;
    // canClick = false;
    const clickedObject = getObjectsIn(x, y)[0];
    // if(!clickedObject)
    //     return;
    const sameColors = bfs(clickedObject);
    sameColors.forEach((val,ind)=>val.remove = true);
    // createNewLine();
    // upOldLines();
    isTripleAvailable(gameObjects)
    

    // canClick = true;
});

new Array(6).fill(0).forEach(()=>
{
    createNewLine();
    upOldLines();
})

pulse(null);