// import * as _ from 'underscore';

// interface IObject {
//     x: number,
//     y: number,
//     color: string
// }

// class Block implements IObject {
//     x: number;
//     y: number;
//     color: string;
//     height: number = 64;
//     width: number = 64;
//     remove: boolean;

//     constructor(x, y, color) {
//         this.color = color;
//         this.x = x;
//         this.y = y;
//         this.remove = false;
//     }
//     get shouldHaveBorder(): boolean {
//         const downNeighbour = getObjectsIn(this.x, this.y + 64)[0];
//         return (downNeighbour && this.color != downNeighbour.color || this.y == canvas.height - this.height);
//     }

//     getNeightbours() {
//         const x = this.x;
//         const y = this.y;
//         return [
//             getObjectsIn(x, y - 64)[0],
//             getObjectsIn(x, y + 64)[0],
//             getObjectsIn(x - 64, y)[0],
//             getObjectsIn(x + 64, y)[0]].filter(q => q);
//     }
//     isDownPlaceEmpty() {
//         return (getObjectsIn(this.x, this.y + 64)[0] == undefined && this.y < canvas.height - this.height)
//     }

//     update() {
//         if (this.isDownPlaceEmpty())
//             this.y += 8;
//     }

// }

// const canvas = document.getElementById('MyCanvas');
// const context = canvas.getContext('2d');

// let dt: number;
// let lastTime: number = 0;
// let gameObjects: Block[] = [];
// let isMoving = false;

// const pulse = (millis): void => {
//     if (lastTime != null && lastTime) {
//         dt = ((millis - lastTime) / 1000);
//         update();
//     }
//     lastTime = millis;
//     window.requestAnimationFrame(pulse);
// }

// const update = () => {

//     gameObjects = gameObjects.filter(q => q.remove == false);
//     isMoving = gameObjects.filter(object => object.isDownPlaceEmpty()).length > 0;
//     gameObjects.forEach(object => object.update());

//     // gameObjects.some(q=>q.y ==0)
//     context.clearRect(0, 0,canvas.width, canvas.height);
//     context.fillStyle = '#806895';
//     context.fillRect(0, 0, 384, 540);
//     context.fillStyle = '#60427a';
//     context.fillRect(64, 0, 384 - 128, 540);

//     gameObjects.forEach((object, ind) => {
//         context.fillStyle = object.color;
//         context.fillRect(object.x, object.y, object.height, object.width);
//     });
// }

// const getRandomColor = (): string => {
//     const colors = ['#ff9e9d', '#f4eea6', '#3fb8af', '#ff3d7f'];
//     let random = Math.floor(Math.random() * colors.length);
//     return colors[random];
// }

// const createNewLine = () => {
//     const size = 64;
//     let y = canvas.height;
//     while (true) {
//         let lineObjects = new Array(4).fill(0).map((val, ind) => new Block(size * (ind + 1), y, getRandomColor()));
//         let result = _.chain(lineObjects).groupBy(q => q.color).map(q => q.length).filter(q => q > 2).value().length == 0;

//         if (result == false)
//             continue;

//         gameObjects = gameObjects.concat(lineObjects);
//         break;
//     }
// }

// const upOldLines = () => {
//     gameObjects.forEach((block) => {
//         block.y -= 64;
//     });
// }

// const bfs = (startBlock: Block) => {
//     let checked: Block[] = [];
//     let queue: Block[] = [];
//     let current: Block;
//     queue.push(startBlock);
//     checked.push(startBlock);
//     while (queue.length) {
//         current = queue.shift();
//         current
//             .getNeightbours()
//             .filter(neigh => neigh.color == current.color)
//             .forEach(neigh => {
//                 if (checked.indexOf(neigh) == -1) {
//                     queue.push(neigh);
//                     checked.push(neigh);
//                 }
//             });
//     }
//     return checked;
// };

// const isTripleAvailable = (objects: Block[]): Block[][] => {
//     return _.chain(objects)
//         .filter(val => val.remove == false)
//         .map(val => bfs(val))
//         .filter(q => q.length > 2 && (rowCountMatch(q[0], 3, Direction.Horizontal) || rowCountMatch(q[0], 3, Direction.Vertical)))
//         .map(val => _.chain(val).sortBy(q => q.x).sortBy(q => q.y).value())
//         .groupBy(q => q[0].x + "|" + q[0].y).map(q => q[0])
//         .value();
// }

// const sortObjects = (a: Block, b: Block): number => {
//     return a.x == b.x && a.y == b.y && a.color == b.color ? 1 : 0;
// }

// const rowCountMatch = (block: Block, blocksInRowCount: number, direction: Direction): boolean => {
//     return new Array(blocksInRowCount)
//         .fill('x')
//         .filter((_, ind) => {
//             let x = direction == Direction.Horizontal ? block.x + (ind * block.width) : block.x;
//             let y = direction == Direction.Vertical ? block.y + (ind * block.height) : block.y;
//             let obj = getObjectsIn(x, y)[0];
//             return (obj && obj.color == block.color);
//         }).length == blocksInRowCount;
// }

// enum Direction {
//     Vertical,
//     Horizontal
// }

// const getObjectsIn = (x: number, y: number) => {
//     return gameObjects.filter((object) => (y >= object.y && y < object.y + object.height
//         && x >= object.x && x < object.x + object.width));
// }

// const timeout = async (wait: number): Promise<void> => new Promise<void>((res) => setTimeout(res, wait));

// const waitForFalling = async (): Promise<boolean> => {
//     while (true) {
//         await timeout(100);
//         if (isMoving == false)
//             return true;
//     }
// }

// let canvasLeftOffset = canvas.offsetLeft;
// let canvasToptOffset = canvas.offsetTop;
// document.addEventListener('click', async (event) => {
//     const x = event.pageX - canvasLeftOffset;
//     const y = event.pageY - canvasToptOffset;

//     const clickedObject = getObjectsIn(x, y)[0];
//     if (!clickedObject || isMoving)
//         return;
//     const sameColors = bfs(clickedObject);
//     sameColors.forEach((val, ind) => val.remove = true);
//     createNewLine();
//     upOldLines();
//     while (true) {
//         await waitForFalling();
//         const triples = isTripleAvailable(gameObjects);
//         if (triples.length == 0)
//             break;
//         triples.forEach(val => val.forEach(q => q.remove = true));
//     }
//     if (gameObjects.length == 0)
//         createNewLine();
// });


// new Array(2).fill(0).forEach(() => {
//     createNewLine();
//     upOldLines();
// })

// pulse(null);

import Game from './Core/Game';

let game = new Game();
game.start();


