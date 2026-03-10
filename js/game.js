class Game {
    constructor() {
        this.pathogen = null;
        this.countries = [];
        this.isRunning = false;
        this.turnInterval = null;
        this.cureRate = 0;
        this.baseCureRate = 0.001;
        this.maxCureRate = 0.1;
        this.turn = 0;
        this.eventTimer = 0;
        
        this.ui = new UIManager();
    }

    init(pathogenType) {
        CountryManager.init();
        this.countries = CountryManager.countries;
        this.pathogen = new Pathogen(pathogenType);
        this.isRunning = true;
        this.turn = 0;
        this.cureRate = this.baseCureRate;
        this.eventTimer = 0;

        this.ui.updatePathogenInfo(this.pathogen);
        this.ui.updateDNA(this.pathogen.dna);
        this.ui.updateInfectionRate(0);
        this.ui.updateStats(this);
        this.ui.renderTransmissionList(this.pathogen);
        this.ui.renderSymptomsList(this.pathogen);
        this.ui.renderAbilitiesList(this.pathogen);
        this.ui.renderWorldMap(this.countries);
        this.ui.addEventLog(`选择了 ${this.pathogen.name} 作为病原体`);

        this.startGameLoop();
    }

    startGameLoop() {
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
        }

        this.turnInterval = setInterval(() => {
            if (this.isRunning) {
                this.gameTick();
            }
        }, 1500);
    }

    gameTick() {
        this.turn++;
        this.pathogen.nextTurn();
        
        this.spreadInfection();
        this.applyCure();
        this.calculateDNAGain();
        this.handleEvents();
        this.updateDifficulty();
        
        this.updateUI();
        this.checkGameEnd();

        if (this.turn % 10 === 0) {
            this.ui.addEventLog(`第 ${this.turn} 回合: 全球感染率 ${(CountryManager.getGlobalInfectionRate() * 100).toFixed(1)}%`);
        }
    }

    spreadInfection() {
        const infectedCountries = this.countries.filter(c => c.infected > 0);
        
        infectedCountries.forEach(country => {
            const resistanceBonus = this.pathogen.getResistanceBonus(country.region);
            const defense = country.defense / 100;
            const effectiveDefense = Math.max(0.05, defense - resistanceBonus);

            const baseSpread = country.infected * this.pathogen.spreadMultiplier * 0.1;
            const actualSpread = baseSpread * (1 - effectiveDefense);

            if (actualSpread > 0) {
                this.countries.forEach(target => {
                    if (target.id !== country.id && target.status !== 'collapsed') {
                        const transBonus = 1 + (this.pathogen.totalTransmissions * 0.1);
                        target.infect(actualSpread * transBonus * 0.01, this.pathogen.currentLethality);
                    }
                });
            }
        });

        if (infectedCountries.length === 0) {
            const startCountries = this.countries.slice(0, 3);
            const spreadAmount = this.pathogen.spreadMultiplier * 10000;
            startCountries.forEach(c => {
                c.infect(spreadAmount, this.pathogen.currentLethality * 0.1);
            });
        }
    }

    applyCure() {
        const totalInfected = CountryManager.getTotalInfected();
        
        if (totalInfected > 0) {
            const drugResistance = this.pathogen.abilities.includes('drugResistance') ? 0.5 : 1;
            
            this.countries.forEach(country => {
                if (country.infected > 0) {
                    country.applyCure(this.cureRate * drugResistance, country.defense / 100);
                }
            });
        }
    }

    calculateDNAGain() {
        const infected = CountryManager.getTotalInfected();
        const totalPop = CountryManager.getTotalPopulation();
        
        if (infected > 0) {
            const dnaGain = Math.floor(infected / 10000000) + 1;
            this.pathogen.addDNA(dnaGain);
        }
    }

    handleEvents() {
        this.eventTimer++;
        
        if (this.eventTimer >= 15) {
            this.eventTimer = 0;
            this.triggerRandomEvent();
        }
    }

    triggerRandomEvent() {
        const events = [
            {
                name: '医疗突破',
                effect: () => {
                    this.cureRate = Math.min(this.maxCureRate, this.cureRate * 1.5);
                    this.ui.addEventLog('⚠️ 医疗突破！治愈速度提升！', 'warning');
                },
                weight: 20
            },
            {
                name: '自然灾害',
                effect: () => {
                    this.countries.forEach(c => {
                        const death = Math.floor(c.population * 0.05);
                        c.dead += Math.min(death, c.infected + c.cured);
                    });
                    this.ui.addEventLog('⚠️ 自然灾害爆发，部分人口死亡！', 'danger');
                },
                weight: 10
            },
            {
                name: '防控加强',
                effect: () => {
                    this.countries.forEach(c => {
                        c.defense = Math.min(100, c.defense + 5);
                    });
                    this.ui.addEventLog('⚠️ 各国加强防控措施！', 'warning');
                },
                weight: 25
            },
            {
                name: '防控减弱',
                effect: () => {
                    this.countries.forEach(c => {
                        c.defense = Math.max(10, c.defense - 5);
                    });
                    this.ui.addEventLog('✨ 某国防控出现漏洞！', 'info');
                },
                weight: 15
            },
            {
                name: '病毒变异',
                effect: () => {
                    this.pathogen.resistance += 1;
                    this.ui.addEventLog('✨ 病原体发生变异，抵抗力增强！', 'info');
                },
                weight: 15
            }
        ];

        const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const event of events) {
            random -= event.weight;
            if (random <= 0) {
                event.effect();
                break;
            }
        }
    }

    updateDifficulty() {
        const infectionRate = CountryManager.getGlobalInfectionRate();
        const progress = Math.min(1, infectionRate);
        
        const targetCureRate = this.baseCureRate + (this.maxCureRate - this.baseCureRate) * progress * 2;
        this.cureRate = Math.min(this.maxCureRate, Math.max(this.cureRate, targetCureRate));
    }

    updateUI() {
        this.ui.updateDNA(this.pathogen.dna);
        this.ui.updateInfectionRate(CountryManager.getGlobalInfectionRate());
        this.ui.updateStats(this);
        this.ui.updateWorldMap(this.countries);
        
        this.ui.renderTransmissionList(this.pathogen);
        this.ui.renderSymptomsList(this.pathogen);
        this.ui.renderAbilitiesList(this.pathogen);
    }

    checkGameEnd() {
        const totalPop = CountryManager.getTotalPopulation();
        const infected = CountryManager.getTotalInfected();
        const dead = CountryManager.getTotalDead();
        const cured = this.countries.reduce((sum, c) => sum + c.cured, 0);
        const remaining = totalPop - dead - cured;

        if (infected + dead + cured >= totalPop * 0.95 || 
            (dead >= totalPop * 0.9 && remaining < totalPop * 0.05)) {
            this.endGame(true);
        } else if (infected === 0 && cured > totalPop * 0.5) {
            this.endGame(false);
        }
    }

    endGame(isVictory) {
        this.isRunning = false;
        
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
            this.turnInterval = null;
        }

        const infectedCountries = CountryManager.getInfectedCountries().length;
        const dead = CountryManager.getTotalDead();

        this.ui.showGameOver(isVictory, {
            countries: infectedCountries,
            deaths: dead,
            turns: this.turn
        });
    }

    buyTransmission(type) {
        if (this.pathogen.buyTransmission(type)) {
            this.ui.addEventLog(`解锁 ${TRANSMISSIONS[type].name} 等级 ${this.pathogen.transmissions[type]}`);
            return true;
        }
        return false;
    }

    buySymptom(symptom) {
        if (this.pathogen.buySymptom(symptom)) {
            this.ui.addEventLog(`解锁症状 ${SYMPTOMS[symptom].name}`);
            return true;
        }
        return false;
    }

    buyAbility(ability) {
        if (this.pathogen.buyAbility(ability)) {
            this.ui.addEventLog(`解锁能力 ${ABILITIES[ability].name}`);
            return true;
        }
        return false;
    }

    reset() {
        if (this.turnInterval) {
            clearInterval(this.turnInterval);
            this.turnInterval = null;
        }
        
        this.pathogen = null;
        this.countries = [];
        this.isRunning = false;
        this.turn = 0;
        this.cureRate = this.baseCureRate;
        
        CountryManager.reset();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
