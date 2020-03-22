import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
  physics: {
    default: 'matter',
    matter: {
        // gravity: new Phaser.Math.Vector2(0, 0),
        debug: false,
    },
  },
};

interface IPlayers {
  [s: string]: {
    sprite: Phaser.Physics.Matter.Sprite;
    jumping: boolean;
  };
}

export class GameScene extends Phaser.Scene {
  protected players: IPlayers;
  protected map: Phaser.Tilemaps.Tilemap;
  protected tileSetsCollisionCategory: any;

  constructor() {
    super(sceneConfig);

    this.players = {};
    this.map = null;
    this.tileSetsCollisionCategory = null;
  }

  public create() {
    this.map = this.make.tilemap({ key: 'map' });

    const tilesetsX5 = this.map.addTilesetImage('tilesetsX5');
    const layerX5 = this.map.createStaticLayer(0, tilesetsX5);

    layerX5.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(layerX5);
  }

  public preload() {}

  public update() {
    Object.keys(this.players).forEach((socketId) => {
      this.players[socketId].sprite.setAngularVelocity(0);
    })
  }

  protected removePlayer(socketId) {
    if (this.players[socketId] && this.players[socketId].sprite) {
      this.players[socketId].sprite.destroy();
    }
    delete this.players[socketId];
  }

  protected generatePlayer(pplayer) {
    const player = this.matter.add.sprite(pplayer.x, pplayer.y, 'player', null, { render: { sprite: { xOffset: 0, yOffset: 0 } }});
    player.setVelocity(pplayer.xVelocity, pplayer.yVelocity);
    player.setBounce(0.3);
    player.setFriction(1, 0);
    player.setCollisionGroup(-1);

    return player;
  }

  protected newPlayer() {
    return this.generatePlayer({x: 800, y: this.map.heightInPixels - 500, xVelocity: 0, yVelocity: 0});
  }

  protected updatePlayer(inputData, socketId) {
    this.players[socketId].jumping = true;
    this.players[socketId].sprite.setVelocity(inputData.xVelocity, inputData.yVelocity);
  }

  protected playerLanding(coord, socketId) {
    // this.players[socketId].jumping = false;
    // this.players[socketId].sprite.setPosition(coord.x, coord.y);
  }
}
