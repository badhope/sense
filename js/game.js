class Game {
    constructor() {
        this.pathogen = null;
        this.countries = [];
        this.turn = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameSpeed = 1;
        this.cureRate = 0;
        this.dnaPerTurn = 1;
        this.eventLog = [];
        this.intervalId = null;
    }

    init(pathogenType) {
        this.pathogen = new Pathogen(pathogenType);
        this.countries = CountryManager.getCountries();
        
        const startCountry = this.countries[Math.floor(Math.random() * 3)];
        startCountry.infected = Math.floor(startCountry.population * 0.01);
        startCountry.status = 'infected';
        
        this.turn = 0;
        this.isRunning = true;
        this.isPaused = false;
        this.cureRate = 0.001;
        
        this.ui = window.ui;
        this.ui.updatePathogenInfo(this.pathogen);
        this.ui.updateDNA(this.pathogen.dna);
        this.ui.updateTurn(this.turn);
        this.ui.renderTransmissionList(this.pathogen);
        this.ui.renderSymptomsList(this.pathogen);
        this.ui.renderAbilitiesList(this.pathogen);
        this.ui.renderWorldMap(this.countries);
        
        this.startGameLoop();
    }

    reset() {
        this.stopGameLoop();
        this.pathogen = null;
        this.countries = [];
        this.turn = 0;
        this.isRunning = false;
        this.cureRate = 0;
    }

    startGameLoop() {
        const baseInterval = 3000;
        const interval = baseInterval / this.gameSpeed;
        
        this.intervalId = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.nextTurn();
            }
        }, interval);
    }

    stopGameLoop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
        if (this.isRunning) {
            this.stopGameLoop();
            this.startGameLoop();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶️ 继续' : '⏸️ 暂停';
        }
    }

    nextTurn() {
        this.turn++;
        this.pathogen.nextTurn();
        
        this.updateCureRate();
        this.spreadPathogen();
        this.updateCountries();
        
        this.calculateDNA();
        this.checkGameEnd();
        
        this.updateUI();
    }

    updateCureRate() {
        const infected = CountryManager.getTotalInfected();
        const total = CountryManager.getTotalPopulation();
        
        if (infected > 0) {
            const baseCure = 0.0001;
            const infectedFactor = Math.min(1, infected / total * 10);
            const researchBonus = this.pathogen.totalSymptoms * 0.001;
            
            this.cureRate = baseCure + infectedFactor * 0.002 + researchBonus;
            
            if (this.pathogen.abilities.includes('drugResistance')) {
                this.cureRate *= 0.7;
            }
            if (this.pathogen.abilities.includes('mutation')) {
                this.cureRate *= 0.9;
            }
        } else {
            this.cureRate = Math.min(0.5, this.cureRate * 1.5);
        }
    }

    spreadPathogen() {
        this.countries.forEach(country => {
            if (country.status === 'healthy') {
                return;
            }

            if (country.status === 'infected') {
                const resistance = country.defense / 100;
                const spreadChance = this.pathogen.spreadMultiplier * (1 - resistance) * (1 - this.cureRate);
                
                const infectAmount = Math.floor(country.infected * spreadChance * 0.3);
                country.infected += infectAmount;
                
                const lethality = this.pathogen.currentLethality;
                const deadAmount = Math.floor(country.infected * lethality * 0.1);
                country.infected -= deadAmount;
                country.dead += deadAmount;
                
                if (country.infected >= country.population) {
                    country.infected = country.population;
                    country.status = 'collapsed';
                    this.ui.addEventLog(`🚨 ${country.name} 已沦陷！`, 'danger');
                } else if (country.infected > country.population * 0.5) {
                    country.status = 'infected';
                }
            }
        });

        const infectedCountries = this.countries.filter(c => c.infected > 0);
        infectedCountries.forEach(infectedCountry => {
            this.countries.forEach(targetCountry => {
                if (targetCountry.status === 'healthy' && Math.random() < 0.15) {
                    const resistance = targetCountry.defense / 100;
                    const spreadChance = this.pathogen.spreadMultiplier * (1 - resistance) * 0.1;
                    
                    const region = targetCountry.region;
                    const regionBonus = this.pathogen.getResistanceBonus(region);
                    
                    if (Math.random() < spreadChance * (1 + regionBonus)) {
                        const initialInfect = Math.floor(targetCountry.population * 0.001);
                        targetCountry.infected = initialInfect;
                        targetCountry.status = 'infected';
                        
                        this.ui.addEventLog(`🦠 ${targetCountry.name} 出现首例感染！`, 'warning');
                    }
                }
            });
        });
    }

    updateCountries() {
        this.countries.forEach(country => {
            country.updateStatus();
        });
    }

    calculateDNA() {
        const infected = CountryManager.getTotalInfected();
        const total = CountryManager.getTotalPopulation();
        
        if (infected > 0) {
            let dnaBase = this.dnaPerTurn;
            
            const infectedRatio = infected / total;
            dnaBase += Math.floor(infectedRatio * 3);
            
            if (this.pathogen.abilities.includes('stealth') && this.turn < 10) {
                dnaBase += 1;
            }
            
            this.pathogen.addDNA(dnaBase);
        }
    }

    checkGameEnd() {
        const totalPop = CountryManager.getTotalPopulation();
        const dead = CountryManager.getTotalDead();
        const infected = CountryManager.getTotalInfected();
        
        if (infected === 0 && this.turn > 5) {
            this.isRunning = false;
            this.stopGameLoop();
            
            const stats = {
                countries: this.countries.filter(c => c.status !== 'healthy').length,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(false, stats);
            return;
        }
        
        const deadRatio = dead / totalPop;
        if (deadRatio >= 0.99) {
            this.isRunning = false;
            this.stopGameLoop();
            
            const stats = {
                countries: this.countries.length,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(true, stats);
            return;
        }

        const collapsedCountries = this.countries.filter(c => c.status === 'collapsed').length;
        if (collapsedCountries >= this.countries.length * 0.95) {
            this.isRunning = false;
            this.stopGameLoop();
            
            const stats = {
                countries: collapsedCountries,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(true, stats);
        }
    }

    updateUI() {
        const infected = CountryManager.getTotalInfected();
        const total = CountryManager.getTotalPopulation();
        
        this.ui.updateDNA(this.pathogen.dna);
        this.ui.updateTurn(this.turn);
        this.ui.updateStats(this);
        this.ui.updateInfectionRate(infected / total);
        this.ui.updateWorldMap(this.countries);
    }

    buyTransmission(type) {
        if (this.pathogen.buyTransmission(type)) {
            this.ui.renderTransmissionList(this.pathogen);
            return true;
        }
        return false;
    }

    buySymptom(symptom) {
        if (this.pathogen.buySymptom(symptom)) {
            this.ui.renderSymptomsList(this.pathogen);
            this.ui.renderAbilitiesList(this.pathogen);
            return true;
        }
        return false;
    }

    buyAbility(ability) {
        if (this.pathogen.buyAbility(ability)) {
            this.ui.renderAbilitiesList(this.pathogen);
            return true;
        }
        return false;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
    window.game = new Game();
    window.ui.init();
});
