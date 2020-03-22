import { ServerGameScene } from './scenes/server-game-scene';
import * as Phaser from 'phaser';

const domWindow = (window as any);

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Jumpy',

  type: Phaser.HEADLESS,

  scene: ServerGameScene,

  autoFocus: false,

  parent: 'game',
  backgroundColor: '#000000',
};

const game = new Phaser.Game(gameConfig);
domWindow.gameLoaded();
