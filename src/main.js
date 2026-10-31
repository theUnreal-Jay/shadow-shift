/**
 * Entry point for SHADOW SHIFT
 */
import './style.css';
import { Game } from './core/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    window.game = new Game(appElement);
  }
});
