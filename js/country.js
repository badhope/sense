const COUNTRIES_DATA = [
    { id: 'us', name: '美国', population: 331000000, defense: 95, region: 'na', x: 120, y: 180 },
    { id: 'ca', name: '加拿大', population: 38000000, defense: 80, region: 'na', x: 120, y: 120 },
    { id: 'mx', name: '墨西哥', population: 128000000, defense: 55, region: 'na', x: 150, y: 220 },
    { id: 'br', name: '巴西', population: 212000000, defense: 50, region: 'sa', x: 250, y: 300 },
    { id: 'ar', name: '阿根廷', population: 45000000, defense: 45, region: 'sa', x: 230, y: 340 },
    { id: 'gb', name: '英国', population: 67000000, defense: 90, region: 'eu', x: 380, y: 140 },
    { id: 'fr', name: '法国', population: 67000000, defense: 88, region: 'eu', x: 390, y: 165 },
    { id: 'de', name: '德国', population: 83000000, defense: 92, region: 'eu', x: 420, y: 150 },
    { id: 'it', name: '意大利', population: 60000000, defense: 85, region: 'eu', x: 430, y: 175 },
    { id: 'ru', name: '俄罗斯', population: 144000000, defense: 75, region: 'eu', x: 550, y: 100 },
    { id: 'cn', name: '中国', population: 1400000000, defense: 70, region: 'as', x: 650, y: 180 },
    { id: 'jp', name: '日本', population: 126000000, defense: 95, region: 'as', x: 720, y: 180 },
    { id: 'kr', name: '韩国', population: 52000000, defense: 90, region: 'as', x: 700, y: 175 },
    { id: 'in', name: '印度', population: 1380000000, defense: 45, region: 'as', x: 580, y: 230 },
    { id: 'id', name: '印尼', population: 273000000, defense: 40, region: 'as', x: 680, y: 290 },
    { id: 'au', name: '澳大利亚', population: 25000000, defense: 75, region: 'oc', x: 720, y: 340 },
    { id: 'za', name: '南非', population: 59000000, defense: 50, region: 'af', x: 450, y: 350 },
    { id: 'eg', name: '埃及', population: 102000000, defense: 55, region: 'af', x: 470, y: 230 },
    { id: 'ng', name: '尼日利亚', population: 206000000, defense: 30, region: 'af', x: 400, y: 280 },
    { id: 'sa', name: '沙特阿拉伯', population: 34000000, defense: 65, region: 'as', x: 510, y: 220 },
    { id: 'tr', name: '土耳其', population: 84000000, defense: 70, region: 'eu', x: 470, y: 180 },
    { id: 'ir', name: '伊朗', population: 84000000, defense: 50, region: 'as', x: 520, y: 200 },
    { id: 'th', name: '泰国', population: 70000000, defense: 55, region: 'as', x: 640, y: 250 },
    { id: 'vn', name: '越南', population: 97000000, defense: 45, region: 'as', x: 660, y: 230 },
    { id: 'pl', name: '波兰', population: 38000000, defense: 80, region: 'eu', x: 450, y: 145 }
];

class Country {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.population = data.population;
        this.defense = data.defense;
        this.region = data.region;
        this.x = data.x;
        this.y = data.y;
        
        this.infected = 0;
        this.dead = 0;
        this.cured = 0;
        this.status = 'healthy';
        this.quarantine = false;
        this.closedBorders = false;
    }

    get infectedRate() {
        return this.population > 0 ? this.infected / this.population : 0;
    }

    get deadRate() {
        return this.population > 0 ? this.dead / this.population : 0;
    }

    get cureRate() {
        const total = this.infected + this.dead + this.cured;
        return total > 0 ? this.cured / total : 0;
    }

    infect(amount, lethality) {
        const remaining = this.population - this.infected - this.dead - this.cured;
        const actualInfect = Math.min(amount, remaining);
        
        this.infected += actualInfect;
        
        const deaths = Math.floor(actualInfect * lethality);
        this.dead += deaths;
        this.infected -= deaths;

        this.updateStatus();
        
        return actualInfect;
    }

    updateStatus() {
        const rate = this.infectedRate;
        
        if (this.quarantine) {
            this.status = 'quarantined';
        } else if (rate >= 0.8) {
            this.status = 'collapsed';
        } else if (rate >= 0.01) {
            this.status = 'infected';
        } else {
            this.status = 'healthy';
        }
    }

    applyCure(cureRate, defenseMultiplier) {
        if (this.infected <= 0) return 0;
        
        const cureAmount = Math.floor(this.infected * cureRate * defenseMultiplier);
        this.cured += cureAmount;
        this.infected = Math.max(0, this.infected - cureAmount);
        
        this.updateStatus();
        
        return cureAmount;
    }

    applyDefense(pathogen, symptomLevel) {
        const baseChance = this.defense / 100;
        const defenseBonus = (pathogen.resistance + symptomLevel * 0.1) / 10;
        const effectiveness = Math.max(0.1, baseChance - defenseBonus);
        
        return effectiveness;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            population: this.population,
            infected: this.infected,
            dead: this.dead,
            cured: this.cured,
            status: this.status
        };
    }
}

const CountryManager = {
    countries: [],
    
    init() {
        this.countries = COUNTRIES_DATA.map(data => new Country(data));
        return this.countries;
    },
    
    getCountry(id) {
        return this.countries.find(c => c.id === id);
    },
    
    getCountriesByRegion(region) {
        return this.countries.filter(c => c.region === region);
    },
    
    getTotalPopulation() {
        return this.countries.reduce((sum, c) => sum + c.population, 0);
    },
    
    getTotalInfected() {
        return this.countries.reduce((sum, c) => sum + c.infected, 0);
    },
    
    getTotalDead() {
        return this.countries.reduce((sum, c) => sum + c.dead, 0);
    },
    
    getAverageCureRate() {
        const totalInfected = this.getTotalInfected();
        const totalCured = this.countries.reduce((sum, c) => sum + c.cured, 0);
        return totalInfected > 0 ? totalCured / totalInfected : 0;
    },
    
    getInfectedCountries() {
        return this.countries.filter(c => c.status !== 'healthy');
    },
    
    getCollapsedCountries() {
        return this.countries.filter(c => c.status === 'collapsed');
    },
    
    getGlobalInfectionRate() {
        const total = this.getTotalPopulation();
        const infected = this.getTotalInfected();
        return total > 0 ? infected / total : 0;
    },
    
    reset() {
        this.countries = [];
        return this.init();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Country, CountryManager, COUNTRIES_DATA };
}
