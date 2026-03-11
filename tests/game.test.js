import { describe, it, expect, beforeEach } from 'vitest';

describe('Pathogen', () => {
    let Pathogen;
    let pathogen;

    beforeEach(async () => {
        const module = await import('./js/pathogen.js');
        Pathogen = module.Pathogen || module.default;
    });

    it('should create pathogen with correct type', () => {
        const pathogen = new Pathogen('bacteria');
        expect(pathogen.type).toBe('bacteria');
    });

    it('should initialize with default DNA', () => {
        const pathogen = new Pathogen('virus');
        expect(pathogen.dna).toBe(2);
    });

    it('should have initial transmission', () => {
        const pathogen = new Pathogen('bacteria');
        expect(pathogen.transmissions).toHaveProperty('air');
    });

    it('should have initial symptom', () => {
        const pathogen = new Pathogen('bacteria');
        expect(pathogen.symptoms).toHaveProperty('cough');
    });

    it('should calculate spread multiplier', () => {
        const pathogen = new Pathogen('bacteria');
        pathogen.transmissions.air = 2;
        expect(pathogen.spreadMultiplier).toBeGreaterThan(1);
    });

    it('should calculate lethality', () => {
        const pathogen = new Pathogen('bacteria');
        const lethality = pathogen.currentLethality;
        expect(lethality).toBeGreaterThan(0);
    });
});

describe('Country', () => {
    let CountryManager;

    beforeEach(async () => {
        const module = await import('./js/country.js');
        CountryManager = module.CountryManager || module.default;
    });

    it('should get countries array', () => {
        const countries = CountryManager.getCountries();
        expect(Array.isArray(countries)).toBe(true);
        expect(countries.length).toBeGreaterThan(0);
    });

    it('should have valid country properties', () => {
        const countries = CountryManager.getCountries();
        const country = countries[0];
        expect(country).toHaveProperty('id');
        expect(country).toHaveProperty('name');
        expect(country).toHaveProperty('population');
    });
});

describe('SaveManager', () => {
    let SaveManager;

    beforeEach(async () => {
        const module = await import('./js/save.js');
        SaveManager = module.SaveManager || module.default;
        localStorage.clear();
    });

    it('should save and load game state', () => {
        const gameState = {
            pathogen: { type: 'bacteria', dna: 10 },
            countries: [],
            turn: 5,
            cureRate: 0.01
        };

        const saveResult = SaveManager.saveGame(gameState);
        expect(saveResult.success).toBe(true);

        const loadResult = SaveManager.loadGame();
        expect(loadResult.success).toBe(true);
        expect(loadResult.data.game.turn).toBe(5);
    });

    it('should check if save exists', () => {
        expect(SaveManager.hasSave()).toBe(false);

        SaveManager.saveGame({ pathogen: {}, countries: [], turn: 0 });
        expect(SaveManager.hasSave()).toBe(true);
    });

    it('should delete save', () => {
        SaveManager.saveGame({ pathogen: {}, countries: [], turn: 0 });
        expect(SaveManager.hasSave()).toBe(true);

        SaveManager.deleteSave();
        expect(SaveManager.hasSave()).toBe(false);
    });
});
