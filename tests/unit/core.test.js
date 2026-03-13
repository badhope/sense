import { describe, it, expect, beforeEach } from 'vitest';
import GameState from '../../src/core/GameState.js';
import SaveManager from '../../src/core/SaveManager.js';
import PathogenSystem from '../../src/systems/PathogenSystem.js';
import CountrySystem, { Country } from '../../src/systems/CountrySystem.js';

// Mock localStorage for Node environment
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    key(index) {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }

    get length() {
        return Object.keys(this.store).length;
    }
}

global.localStorage = new LocalStorageMock();

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    it('should initialize with default values', () => {
        expect(gameState.turn).toBe(0);
        expect(gameState.isRunning).toBe(false);
        expect(gameState.pathogen.type).toBeNull();
        expect(gameState.pathogen.dna).toBe(0);
    });

    it('should reset all state values', () => {
        gameState.turn = 10;
        gameState.pathogen.dna = 50;
        gameState.isRunning = true;
        
        gameState.reset();
        
        expect(gameState.turn).toBe(0);
        expect(gameState.pathogen.dna).toBe(0);
        expect(gameState.isRunning).toBe(false);
    });

    it('should serialize to JSON', () => {
        gameState.turn = 5;
        gameState.pathogen.dna = 10;
        
        const json = gameState.toJSON();
        
        expect(json.version).toBe('2.0.0');
        expect(json.turn).toBe(5);
        expect(json.data.pathogen.dna).toBe(10);
    });

    it('should deserialize from JSON', () => {
        const jsonData = {
            turn: 15,
            data: {
                pathogen: { dna: 25, type: 'virus' },
                countries: [],
                cureProgress: 0.5
            }
        };
        
        gameState.fromJSON(jsonData);
        
        expect(gameState.turn).toBe(15);
        expect(gameState.pathogen.dna).toBe(25);
        expect(gameState.pathogen.type).toBe('virus');
    });
});

describe('SaveManager', () => {
    let saveManager;

    beforeEach(() => {
        saveManager = new SaveManager();
        localStorage.clear();
    });

    it('should save and load game state', () => {
        const gameState = new GameState();
        gameState.turn = 10;
        gameState.pathogen.dna = 50;
        
        const saveResult = saveManager.saveGame(gameState);
        
        expect(saveResult.success).toBe(true);
        
        const loadResult = saveManager.loadGame();
        
        expect(loadResult.success).toBe(true);
        // loadResult.data 包含完整的存档结构
        expect(loadResult.data.turn).toBe(10);
        expect(loadResult.data.data.pathogen.dna).toBe(50);
    });

    it('should check if save exists', () => {
        expect(saveManager.hasSave()).toBe(false);
        
        saveManager.saveGame(new GameState());
        
        expect(saveManager.hasSave()).toBe(true);
    });

    it('should delete save', () => {
        saveManager.saveGame(new GameState());
        expect(saveManager.hasSave()).toBe(true);
        
        saveManager.deleteSave(0);
        
        expect(saveManager.hasSave()).toBe(false);
    });

    it('should maintain maximum save count', () => {
        for (let i = 0; i < 5; i++) {
            const gameState = new GameState();
            gameState.turn = i;
            saveManager.saveGame(gameState);
        }
        
        const saves = saveManager.getAllSaves();
        expect(saves.length).toBe(3);
        expect(saves[0].turn).toBe(4);
    });

    it('should generate and verify checksum', () => {
        const gameState = new GameState();
        gameState.turn = 20;
        
        const checksum = saveManager.generateChecksum(gameState);
        expect(typeof checksum).toBe('string');
        expect(checksum.length).toBeGreaterThan(0);
    });
});

describe('PathogenSystem', () => {
    let pathogenSystem;

    beforeEach(() => {
        pathogenSystem = new PathogenSystem();
    });

    it('should create pathogen with correct type', () => {
        const pathogen = pathogenSystem.createPathogen('bacteria');
        
        expect(pathogen.type).toBe('bacteria');
        expect(pathogen.dna).toBe(2);
        expect(pathogen.spreadMultiplier).toBe(1.2);
    });

    it('should throw error for unknown pathogen type', () => {
        expect(() => pathogenSystem.createPathogen('unknown')).toThrow();
    });

    it('should upgrade transmission successfully', () => {
        const gameState = new GameState();
        gameState.pathogen = pathogenSystem.createPathogen('bacteria');
        gameState.pathogen.dna = 10;
        
        const result = pathogenSystem.upgradeTransmission(gameState, 'air');
        
        expect(result.success).toBe(true);
        expect(gameState.pathogen.transmissions.air).toBe(1);
        expect(gameState.pathogen.dna).toBe(9);
    });

    it('should fail upgrade when not enough DNA', () => {
        const gameState = new GameState();
        gameState.pathogen = pathogenSystem.createPathogen('bacteria');
        gameState.pathogen.dna = 0;
        
        const result = pathogenSystem.upgradeTransmission(gameState, 'air');
        
        expect(result.success).toBe(false);
    });

    it('should upgrade symptom successfully', () => {
        const gameState = new GameState();
        gameState.pathogen = pathogenSystem.createPathogen('bacteria');
        gameState.pathogen.dna = 10;
        gameState.pathogen.transmissions.air = 1;
        
        const result = pathogenSystem.upgradeSymptom(gameState, 'cough');
        
        expect(result.success).toBe(true);
        expect(gameState.pathogen.symptoms.cough).toBe(true);
        expect(gameState.pathogen.dna).toBe(9);
    });

    it('should calculate spread multiplier correctly', () => {
        const gameState = new GameState();
        gameState.pathogen = pathogenSystem.createPathogen('bacteria');
        
        const multiplier = pathogenSystem.getSpreadMultiplier(gameState);
        
        expect(multiplier).toBe(1.2);
    });
});

describe('CountrySystem', () => {
    let countrySystem;

    beforeEach(() => {
        countrySystem = new CountrySystem();
    });

    it('should initialize with countries', () => {
        const countries = countrySystem.getCountries();
        
        expect(Array.isArray(countries)).toBe(true);
        expect(countries.length).toBeGreaterThan(0);
    });

    it('should get country by id', () => {
        const country = countrySystem.getCountryById('cn');
        
        expect(country).toBeDefined();
        expect(country.name).toBe('中国');
    });

    it('should calculate total population', () => {
        const total = countrySystem.getTotalPopulation();
        
        expect(total).toBeGreaterThan(0);
    });

    it('should infect country', () => {
        const result = countrySystem.infectCountry('cn', 1000);
        
        expect(result).toBe(true);
        
        const country = countrySystem.getCountryById('cn');
        expect(country.infected).toBe(1000);
        expect(country.status).toBe('infected');
    });

    it('should update country status based on infection', () => {
        const country = new Country({
            id: 'test',
            name: 'Test',
            population: 1000000,
            region: 'as',
            defense: 50,
            economy: 50
        });
        
        expect(country.status).toBe('healthy');
        
        country.infected = 1000;
        country.updateStatus();
        expect(country.status).toBe('infected');
        
        country.dead = 950000;
        country.updateStatus();
        expect(country.status).toBe('collapsed');
    });

    it('should get countries by region', () => {
        const asianCountries = countrySystem.getCountriesByRegion('as');
        
        expect(asianCountries.length).toBeGreaterThan(0);
        asianCountries.forEach(c => {
            expect(c.region).toBe('as');
        });
    });

    it('should update countries with infection spread', () => {
        const gameState = {
            pathogen: {
                spreadMultiplier: 1.5,
                lethality: 0.05
            }
        };
        
        countrySystem.infectCountry('cn', 10000);
        countrySystem.update(gameState);
        
        const totalInfected = countrySystem.getTotalInfected();
        expect(totalInfected).toBeGreaterThan(10000);
    });
});

describe('Game Integration', () => {
    it('should have all required modules', () => {
        expect(GameState).toBeDefined();
        expect(SaveManager).toBeDefined();
        expect(PathogenSystem).toBeDefined();
        expect(CountrySystem).toBeDefined();
    });
});
