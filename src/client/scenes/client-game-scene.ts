import { GameScene } from '../../shared/scenes/game-scene';

export class ClientGameScene extends GameScene {
  private player: Phaser.Physics.Matter.Sprite
  private spaceKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private spaceKeyDuration: number;
  private socket: any;
  private jumping: boolean;

  constructor() {
    super();
  }

  public create() {
    super.create();

    this.socket = (window as any).io();
    this.player = this.newPlayer();
    this.jumping = false;

    // this.cameras.main.setBounds(0, this.map.heightInPixels - window.innerHeight, window.innerWidth, window.innerHeight);
    this.cameras.main.setBounds(0, 0, window.innerWidth, window.innerHeight);

    this.spaceKeyDuration = 0;
    this.spaceKey = this.input.keyboard.addKey('SPACE');
    this.rightKey = this.input.keyboard.addKey('RIGHT');
    this.leftKey = this.input.keyboard.addKey('LEFT');

    this.anims.create({
      key: 'pre-jump',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 8 }),
      frameRate: 16,
      repeat: 0,
    });

    this.spaceKey.on('down', () => {
      this.player.anims.play('pre-jump');
    });

    this.spaceKey.on('up', () => {
      let xVelocity = 0;
      let yVelocity = 0;
      const speed = 0.01;
      if (this.rightKey.isDown) {
        xVelocity = this.spaceKeyDuration * speed;
        yVelocity = this.spaceKeyDuration * -speed;
      } else if (this.leftKey.isDown) {
        xVelocity = this.spaceKeyDuration * -speed;
        yVelocity = this.spaceKeyDuration * -speed;
      } else {
        yVelocity = this.spaceKeyDuration * -speed;
      }

      this.player.anims.play('jump');
      this.jumping = true;

      this.player.setVelocity(xVelocity, yVelocity);
      this.socket.emit('updatePlayer', { xVelocity, yVelocity });
    });

    this.socket.on('newPlayer', (socketId) => {
      if (socketId === this.socket.id) { return; }

      this.players[socketId] = {sprite: this.newPlayer(), jumping: false};
    });

    this.socket.on('playerUpdate', (playerUpdate) => {
      if (!this.players[playerUpdate.socketId]) { return; }

      console.log(playerUpdate)
      this.updatePlayer(playerUpdate.inputData, playerUpdate.socketId);
    });

    this.socket.on('disconnect', (socketId) => {
      if (!this.players[socketId]) { return; }

      this.removePlayer(socketId);
    });

    this.socket.on('playersInfos', (pplayers) => {
      this.playersInfos(pplayers);
    });

  }

  public preload() {
      super.preload();

      this.load.tilemapTiledJSON('map', 'assets/map.json');
      this.load.image('tilesets', 'assets/tilesets.png');
      this.load.image('tilesetsX5', 'assets/tilesetsX5.png');
      this.load.spritesheet('player', 'assets/player.png', {
        frameWidth: 80,
        frameHeight: 80,
        startFrame: 0,
        endFrame: 8,
      });
  }

  public update() {
    super.update();

    // @ts-ignore
    if (this.jumping && this.player.body.velocity.x === 0 && this.player.body.velocity.y) {
      this.jumping = false;
      this.socket.emit('landing', { x: this.player.x, y: this.player.y });
    }

    const numberOfScreens = Math.ceil(this.map.heightInPixels / window.innerHeight);
    const currentScreen = Math.floor(this.player.y / window.innerHeight);

    this.cameras.main.setBounds(0, (this.map.heightInPixels - (window.innerHeight * (numberOfScreens - currentScreen))), window.innerWidth, window.innerHeight);
    this.spaceKeyDuration = this.spaceKey.getDuration();

    this.player.setAngularVelocity(0);
  }

  private playersInfos(playersInfos) {
    Object.keys(playersInfos).forEach((socketId) => {
      if (socketId === this.socket.id) { return; }

      this.players[socketId] = {sprite: this.generatePlayer(playersInfos[socketId]), jumping: false};
    });
  }
}
