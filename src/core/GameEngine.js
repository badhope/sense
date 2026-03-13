import GameState from './GameState.js';
import SaveManager from './SaveManager.js';

class GameEngine {
    constructor() {
        this.state = new GameState();
        this.saveManager = new SaveManager();
        this.systems = {};
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.listeners = {};
    }
    
    init(config = {}) {
        console.log('GameEngine: Initializing...');
        
        this.state.reset();
        this.state.startTime = Date.now();
        
        this.loadSystems(config);
        this.setupEventListeners();
        
        console.log('GameEngine: Initialized successfully');
        return true;
    }
    
    loadSystems(config) {
        if (config.pathogenSystem) {
            this.systems.pathogen = config.pathogenSystem;
        }
        if (config.countrySystem) {
            this.systems.countries = config.countrySystem;
        }
        if (config.storyEngine) {
            this.systems.story = config.storyEngine;
        }
        if (config.eventSystem) {
            this.systems.events = config.eventSystem;
        }
    }
    
    setupEventListeners() {
        this.listeners.gameStateChange = [];
        this.listeners.turnEnd = [];
        this.listeners.choice = [];
        this.listeners.gameStart = [];
        this.listeners.gameStop = [];
        this.listeners.gamePause = [];
        this.listeners.gameResume = [];
        this.listeners.cureComplete = [];
        this.listeners.victory = [];
        this.listeners.defeat = [];
        this.listeners.eventTriggered = [];
    }
    
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    start() {
        if (this.isRunning) {
            console.warn('GameEngine: Already running');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.startGameLoop();
        this.emit('gameStart', { turn: this.state.turn });
        
        console.log('GameEngine: Started');
    }
    
    stop() {
        this.isRunning = false;
        this.stopGameLoop();
        this.emit('gameStop', {});
        
        console.log('GameEngine: Stopped');
    }
    
    pause() {
        this.isPaused = true;
        this.emit('gamePause', {});
        console.log('GameEngine: Paused');
    }
    
    resume() {
        this.isPaused = false;
        this.emit('gameResume', {});
        console.log('GameEngine: Resumed');
    }
    
    startGameLoop() {
        const baseInterval = 3000;
        const interval = baseInterval / this.state.gameSpeed;
        
        this.gameLoop = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.nextTurn();
            }
        }, interval);
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    nextTurn() {
        this.state.turn++;
        
        this.updatePathogen();
        this.updateCountries();
        this.updateCureProgress();
        this.checkRandomEvents();
        this.checkVictoryConditions();
        
        this.emit('turnEnd', { turn: this.state.turn });
    }
    
    updatePathogen() {
        if (this.systems.pathogen) {
            this.systems.pathogen.update(this.state);
        }
    }
    
    updateCountries() {
        if (this.systems.countries) {
            this.systems.countries.update(this.state);
        }
    }
    
    updateCureProgress() {
        const baseCureRate = this.state.cureRate;
        const panicBonus = this.state.globalPanic * 0.001;
        this.state.cureProgress += (baseCureRate + panicBonus);
        
        if (this.state.cureProgress >= 1) {
            this.state.cureProgress = 1;
            this.emit('cureComplete', {});
        }
    }
    
    checkRandomEvents() {
        if (this.systems.events && Math.random() < 0.3) {
            const event = this.systems.events.triggerRandom(this.state);
            if (event) {
                this.emit('eventTriggered', event);
            }
        }
    }
    
    makeChoice(choiceId) {
        if (this.systems.story) {
            const result = this.systems.story.processChoice(choiceId, this.state);
            if (result) {
                this.state.choices.push({
                    turn: this.state.turn,
                    choiceId,
                    result
                });
                this.emit('choice', result);
                return result;
            }
        }
        return null;
    }
    
    checkVictoryConditions() {
        const infectedRate = this.state.globalInfected / this.state.totalPopulation;
        const cureComplete = this.state.cureProgress >= 1;
        
        if (infectedRate >= 1) {
            this.emit('victory', { type: 'infection' });
            this.stop();
        } else if (cureComplete) {
            this.emit('defeat', { type: 'cure' });
            this.stop();
        }
    }
    
    saveGame() {
        return this.saveManager.saveGame(this.state);
    }
    
    loadGame(index = 0) {
        const result = this.saveManager.loadGame(index);
        if (result.success) {
            this.state.fromJSON(result.data);
            this.isRunning = true;
            this.startGameLoop();
        }
        return result;
    }
    
    hasSave() {
        return this.saveManager.hasSave();
    }
    
    getState() {
        return this.state;
    }
    
    setGameSpeed(speed) {
        this.state.gameSpeed = Math.max(0.5, Math.min(5, speed));
        if (this.isRunning) {
            this.stopGameLoop();
            this.startGameLoop();
        }
    }
}

export default GameEngine;
