class GameState {
    constructor() {
        this.turn = 0;
        this.startTime = null;
        this.lastSaveTime = null;
        this.gameSpeed = 1;
        this.isPaused = false;
        this.isRunning = false;
        
        this.pathogen = {
            type: null,
            dna: 0,
            transmissions: {},
            symptoms: {},
            abilities: {},
            spreadMultiplier: 1,
            lethality: 0,
            mutationRate: 0.01
        };
        
        this.countries = [];
        this.globalInfected = 0;
        this.globalDead = 0;
        this.totalPopulation = 0;
        
        this.cureProgress = 0;
        this.cureRate = 0.001;
        this.globalPanic = 0;
        this.travelRestrictions = 0;
        this.economicImpact = 0;
        
        this.currentStoryNode = 'start';
        this.visitedNodes = [];
        this.choices = [];
        this.achievements = [];
        
        this.eventLog = [];
        this.newsFeed = [];
    }
    
    reset() {
        this.turn = 0;
        this.startTime = null;
        this.lastSaveTime = null;
        this.gameSpeed = 1;
        this.isPaused = false;
        this.isRunning = false;
        
        this.pathogen = {
            type: null,
            dna: 0,
            transmissions: {},
            symptoms: {},
            abilities: {},
            spreadMultiplier: 1,
            lethality: 0,
            mutationRate: 0.01
        };
        
        this.countries = [];
        this.globalInfected = 0;
        this.globalDead = 0;
        this.totalPopulation = 0;
        
        this.cureProgress = 0;
        this.cureRate = 0.001;
        this.globalPanic = 0;
        this.travelRestrictions = 0;
        this.economicImpact = 0;
        
        this.currentStoryNode = 'start';
        this.visitedNodes = [];
        this.choices = [];
        this.achievements = [];
        
        this.eventLog = [];
        this.newsFeed = [];
    }
    
    toJSON() {
        return {
            version: '2.0.0',
            timestamp: Date.now(),
            turn: this.turn,
            startTime: this.startTime,
            gameSpeed: this.gameSpeed,
            data: {
                pathogen: this.pathogen,
                countries: this.countries,
                globalInfected: this.globalInfected,
                globalDead: this.globalDead,
                totalPopulation: this.totalPopulation,
                cureProgress: this.cureProgress,
                cureRate: this.cureRate,
                globalPanic: this.globalPanic,
                travelRestrictions: this.travelRestrictions,
                economicImpact: this.economicImpact,
                currentStoryNode: this.currentStoryNode,
                visitedNodes: this.visitedNodes,
                choices: this.choices,
                achievements: this.achievements,
                eventLog: this.eventLog,
                newsFeed: this.newsFeed
            }
        };
    }
    
    fromJSON(json) {
        const data = json.data || json;
        this.turn = json.turn || data.turn || 0;
        this.pathogen = { ...this.pathogen, ...data.pathogen };
        this.countries = data.countries || [];
        this.cureProgress = data.cureProgress || 0;
        this.globalPanic = data.globalPanic || 0;
        this.currentStoryNode = data.currentStoryNode || 'start';
        this.visitedNodes = data.visitedNodes || [];
        this.choices = data.choices || [];
        this.achievements = data.achievements || [];
        this.eventLog = data.eventLog || [];
        this.isRunning = true;
        return this;
    }
}

export default GameState;
