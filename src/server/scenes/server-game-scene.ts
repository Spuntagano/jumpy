import { GameScene } from '../../shared/scenes/game-scene';

const domWindow = (window as any);

export class ServerGameScene extends GameScene {
private pplayers: any;

  constructor() {
    super();

    this.pplayers = {};
  }

  public create() {
    super.create();

    domWindow.io.on('connection', (socket) => {
      this.pplayers[socket.id] = {
        x: 800,
        y: 53780.51969724747,
        xVelocity: 0,
        yVelocity: 0,
      };

      socket.broadcast.emit('newPlayer', socket.id);
      socket.emit('playersInfos', this.pplayers);

      socket.on('disconnect', () => {
        this.removePlayer(socket.id);
        domWindow.io.emit('disconnect', socket.id);
      });

      socket.on('updatePlayer', (inputData) => {
        domWindow.io.emit('playerUpdate', {
          socketId: socket.id,
          inputData,
        });
      });

      socket.on('landing', (coord) => {
        domWindow.io.emit('playerLanding', {
          socketId: socket.id,
          coord,
        });
      });
    });
  }

  public preload() {
    super.preload();

    this.load.tilemapTiledJSON('map', '../../dist/assets/map.json');
    this.load.image('tilesets', '../../dist/assets/tilesets.png');
    this.load.image('tilesetsX5', '../../dist/assets/tilesetsX5.png');
    this.load.image('player', '../../dist/assets/player.png');
  }

  public update() {
    super.update();
  }
}
