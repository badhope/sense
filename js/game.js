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
        this.storyManager = new StoryManager();
        this.newsScrollInterval = null;
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
        
        const pathogenStory = this.storyManager.getPathogenStory(pathogenType);
        this.ui.showPathogenStory(pathogenStory);
        
        this.startNewsScroll();
        this.startGameLoop();
    }

    reset() {
        this.stopGameLoop();
        this.stopNewsScroll();
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
            pauseBtn.textContent = this.isPaused ? '▶' : '⏸';
            pauseBtn.title = this.isPaused ? '继续' : '暂停';
        }
    }

    saveGame() {
        const gameState = {
            pathogen: this.pathogen,
            countries: this.countries,
            turn: this.turn,
            dnaPerTurn: this.dnaPerTurn,
            cureRate: this.cureRate,
            isPaused: this.isPaused,
            gameSpeed: this.gameSpeed,
            isRunning: this.isRunning
        };
        
        const result = SaveManager.saveGame(gameState);
        if (result.success) {
            this.ui.addEventLog('💾 游戏已保存', 'success');
        } else {
            this.ui.addEventLog('❌ ' + result.message, 'error');
        }
        return result;
    }

    loadGame() {
        const result = SaveManager.loadGame();
        
        if (!result.success) {
            this.ui.addEventLog('❌ ' + result.message, 'error');
            return result;
        }
        
        const data = result.data;
        
        this.pathogen = new Pathogen(data.pathogen.type);
        this.pathogen.dna = data.pathogen.dna;
        this.pathogen.transmissions = data.pathogen.transmissions;
        this.pathogen.symptoms = data.pathogen.symptoms;
        this.pathogen.abilities = data.pathogen.abilities;
        this.pathogen.turn = data.pathogen.turn;
        
        this.countries = CountryManager.getCountries();
        this.countries.forEach(country => {
            const saved = data.countries.find(sc => sc.id === country.id);
            if (saved) {
                country.infected = saved.infected;
                country.dead = saved.dead;
                country.status = saved.status;
                country.defense = saved.defense;
            }
        });
        
        this.turn = data.game.turn;
        this.dnaPerTurn = data.game.dnaPerTurn;
        this.cureRate = data.game.cureRate;
        this.gameSpeed = data.game.gameSpeed;
        this.isRunning = data.game.isRunning;
        this.isPaused = data.game.isPaused;
        
        this.ui.updatePathogenInfo(this.pathogen);
        this.ui.updateDNA(this.pathogen.dna);
        this.ui.updateTurn(this.turn);
        this.ui.renderTransmissionList(this.pathogen);
        this.ui.renderSymptomsList(this.pathogen);
        this.ui.renderAbilitiesList(this.pathogen);
        this.ui.renderWorldMap(this.countries);
        
        if (this.isRunning && !this.isPaused) {
            this.startGameLoop();
        }
        
        this.ui.addEventLog('📂 游戏已加载 - 第' + this.turn + '回合', 'success');
        
        return result;
    }

    startNewsScroll() {
        this.updateNewsHeadline();
        this.newsScrollInterval = setInterval(() => {
            this.updateNewsHeadline();
        }, 5000);
    }

    stopNewsScroll() {
        if (this.newsScrollInterval) {
            clearInterval(this.newsScrollInterval);
            this.newsScrollInterval = null;
        }
    }

    updateNewsHeadline() {
        const totalInfected = CountryManager.getTotalInfected();
        const totalPop = CountryManager.getTotalPopulation();
        const infectedRatio = totalPop > 0 ? totalInfected / totalPop : 0;
        
        const isPanic = infectedRatio > 0.1 || this.turn > 20;
        const headline = this.storyManager.getNewsHeadline(isPanic);
        
        const headlineEl = document.getElementById('news-headline');
        if (headlineEl) {
            headlineEl.style.opacity = 0;
            setTimeout(() => {
                headlineEl.textContent = headline;
                headlineEl.style.opacity = 1;
            }, 300);
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
                    
                    const countryStory = this.storyManager.getCountryStory(country.id);
                    const message = countryStory ? 
                        this.storyManager.getEventMessage('country', 'collapse', country.name) :
                        `${country.name} 已经沦陷！`;
                    
                    this.ui.addEventLog(`🚨 ${message}`, 'danger');
                    
                    if (countryStory && countryStory.collapse) {
                        this.ui.showCountryEvent(country.name, 'collapse', countryStory.collapse);
                    }
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
                        
                        const countryStory = this.storyManager.getCountryStory(targetCountry.id);
                        const message = countryStory ?
                            this.storyManager.getEventMessage('country', 'infection', targetCountry.name) :
                            `${targetCountry.name} 出现首例感染！`;
                        
                        this.ui.addEventLog(`🦠 ${message}`, 'warning');
                        
                        if (countryStory && countryStory.firstReport) {
                            this.ui.showCountryEvent(targetCountry.name, 'firstReport', countryStory.firstReport);
                        }
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
            this.stopNewsScroll();
            
            const ending = this.storyManager.getEnding('defeat');
            
            const stats = {
                countries: this.countries.filter(c => c.status !== 'healthy').length,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(false, stats, ending);
            return;
        }
        
        const deadRatio = dead / totalPop;
        const infectedRatio = infected / totalPop;
        
        if (deadRatio >= 0.99 || infectedRatio >= 0.99) {
            this.isRunning = false;
            this.stopGameLoop();
            this.stopNewsScroll();
            
            const endingType = this.storyManager.calculateVictoryType(deadRatio, infectedRatio, this.turn);
            const ending = this.storyManager.getEnding(endingType);
            
            const stats = {
                countries: this.countries.length,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(true, stats, ending);
            return;
        }

        const collapsedCountries = this.countries.filter(c => c.status === 'collapsed').length;
        if (collapsedCountries >= this.countries.length * 0.95) {
            this.isRunning = false;
            this.stopGameLoop();
            this.stopNewsScroll();
            
            const ending = this.storyManager.getEnding('total_victory');
            
            const stats = {
                countries: collapsedCountries,
                deaths: dead,
                turns: this.turn
            };
            
            this.ui.showGameOver(true, stats, ending);
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
        
        this.updateSpecialEvents();
    }

    updateSpecialEvents() {
        const infected = CountryManager.getTotalInfected();
        const total = CountryManager.getTotalPopulation();
        const infectedRatio = infected / total;
        
        if (this.turn === 5 && infectedRatio > 0) {
            this.ui.addEventLog('📢 世界卫生组织召开紧急会议...', 'info');
        }
        
        if (this.turn === 10 && infectedRatio > 0.01) {
            this.ui.addEventLog('📢 全球大流行预警！', 'warning');
            const message = this.storyManager.getEventMessage('world', 'pandemic');
            this.ui.addEventLog(message, 'warning');
        }
        
        if (this.turn === 20 && infectedRatio > 0.1) {
            this.ui.addEventLog('📢 多国开始实施封城措施', 'danger');
        }
        
        if (this.turn === 50 && infectedRatio > 0.3) {
            const message = this.storyManager.getEventMessage('world', 'vaccine');
            this.ui.addEventLog(message, 'warning');
        }
    }

    buyTransmission(type) {
        if (this.pathogen.buyTransmission(type)) {
            this.ui.renderTransmissionList(this.pathogen);
            
            const message = this.storyManager.getEventMessage('transmission', type);
            if (message) {
                this.ui.addEventLog(`🧬 ${message}`, 'info');
            }
            return true;
        }
        return false;
    }

    buySymptom(symptom) {
        if (this.pathogen.buySymptom(symptom)) {
            this.ui.renderSymptomsList(this.pathogen);
            this.ui.renderAbilitiesList(this.pathogen);
            
            const message = this.storyManager.getEventMessage('symptom', symptom);
            if (message) {
                this.ui.addEventLog(`🤒 ${message}`, 'warning');
            }
            return true;
        }
        return false;
    }

    buyAbility(ability) {
        if (this.pathogen.buyAbility(ability)) {
            this.ui.renderAbilitiesList(this.pathogen);
            
            const message = this.storyManager.getEventMessage('ability', ability);
            if (message) {
                this.ui.addEventLog(`✨ ${message}`, 'info');
            }
            return true;
        }
        return false;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
    window.game = new Game();
    window.ui.init();

    window.soundManager.init();

    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const pauseBtn = document.getElementById('pause-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (window.game && window.game.isRunning) {
                window.game.saveGame();
            } else {
                window.ui?.addEventLog('❌ 请先开始游戏', 'error');
            }
        });
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            if (window.game) {
                if (window.game.isRunning) {
                    if (confirm('加载存档将覆盖当前进度，是否继续？')) {
                        window.game.loadGame();
                    }
                } else {
                    window.game.loadGame();
                }
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (window.game && window.game.isRunning) {
                window.game.togglePause();
            }
        });
    }
});
