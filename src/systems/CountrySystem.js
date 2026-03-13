class Country {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.population = data.population;
        this.region = data.region;
        this.defense = data.defense;
        this.economy = data.economy;
        
        this.infected = 0;
        this.dead = 0;
        this.status = 'healthy';
        this.lockdownLevel = 0;
        this.treatmentQuality = 0;
    }
    
    get infectedRate() {
        return this.population > 0 ? this.infected / this.population : 0;
    }
    
    get deadRate() {
        return this.population > 0 ? this.dead / this.population : 0;
    }
    
    get healthyPopulation() {
        return this.population - this.infected - this.dead;
    }
    
    updateStatus() {
        if (this.infected === 0) {
            this.status = 'healthy';
        } else if (this.dead >= this.population * 0.9) {
            this.status = 'collapsed';
        } else if (this.infected > 0) {
            this.status = 'infected';
        }
    }
    
    implementLockdown(level) {
        this.lockdownLevel = Math.min(3, Math.max(0, level));
        return this.lockdownLevel;
    }
    
    improveTreatment(level) {
        this.treatmentQuality = Math.min(5, Math.max(0, level));
        return this.treatmentQuality;
    }
}

const COUNTRIES_DATA = [
    { id: 'cn', name: '中国', population: 1400000000, region: 'as', defense: 85, economy: 95 },
    { id: 'in', name: '印度', population: 1380000000, region: 'as', defense: 70, economy: 75 },
    { id: 'us', name: '美国', population: 331000000, region: 'na', defense: 90, economy: 100 },
    { id: 'id', name: '印度尼西亚', population: 273500000, region: 'as', defense: 65, economy: 70 },
    { id: 'pk', name: '巴基斯坦', population: 220900000, region: 'as', defense: 60, economy: 55 },
    { id: 'br', name: '巴西', population: 212600000, region: 'sa', defense: 75, economy: 80 },
    { id: 'ng', name: '尼日利亚', population: 206100000, region: 'af', defense: 50, economy: 50 },
    { id: 'bd', name: '孟加拉国', population: 164700000, region: 'as', defense: 65, economy: 55 },
    { id: 'ru', name: '俄罗斯', population: 144100000, region: 'eu', defense: 80, economy: 65 },
    { id: 'mx', name: '墨西哥', population: 128900000, region: 'na', defense: 70, economy: 70 },
    { id: 'jp', name: '日本', population: 126500000, region: 'as', defense: 95, economy: 90 },
    { id: 'et', name: '埃塞俄比亚', population: 115000000, region: 'af', defense: 45, economy: 40 },
    { id: 'ph', name: '菲律宾', population: 109600000, region: 'as', defense: 65, economy: 60 },
    { id: 'eg', name: '埃及', population: 102300000, region: 'af', defense: 60, economy: 55 },
    { id: 'vn', name: '越南', population: 97300000, region: 'as', defense: 70, economy: 60 },
    { id: 'dr', name: '刚果民主共和国', population: 89560000, region: 'af', defense: 40, economy: 35 },
    { id: 'tr', name: '土耳其', population: 84340000, region: 'eu', defense: 75, economy: 70 },
    { id: 'ir', name: '伊朗', population: 83990000, region: 'as', defense: 70, economy: 55 },
    { id: 'de', name: '德国', population: 83780000, region: 'eu', defense: 90, economy: 90 },
    { id: 'th', name: '泰国', population: 69800000, region: 'as', defense: 70, economy: 65 },
    { id: 'gb', name: '英国', population: 67890000, region: 'eu', defense: 85, economy: 85 },
    { id: 'fr', name: '法国', population: 67390000, region: 'eu', defense: 85, economy: 85 },
    { id: 'it', name: '意大利', population: 60460000, region: 'eu', defense: 80, economy: 80 },
    { id: 'za', name: '南非', population: 59310000, region: 'af', defense: 65, economy: 60 },
    { id: 'kr', name: '韩国', population: 51270000, region: 'as', defense: 90, economy: 85 },
    { id: 'es', name: '西班牙', population: 46750000, region: 'eu', defense: 80, economy: 80 },
    { id: 'ar', name: '阿根廷', population: 45200000, region: 'sa', defense: 70, economy: 65 },
    { id: 'ca', name: '加拿大', population: 38000000, region: 'na', defense: 85, economy: 85 },
    { id: 'au', name: '澳大利亚', population: 25490000, region: 'oc', defense: 80, economy: 80 },
    { id: 'nl', name: '荷兰', population: 17440000, region: 'eu', defense: 85, economy: 85 }
];

class CountrySystem {
    constructor() {
        this.countries = [];
        this.init();
    }
    
    init() {
        this.countries = COUNTRIES_DATA.map(data => new Country(data));
    }
    
    getCountries() {
        return this.countries;
    }
    
    getCountryById(id) {
        return this.countries.find(c => c.id === id);
    }
    
    getTotalPopulation() {
        return this.countries.reduce((sum, c) => sum + c.population, 0);
    }
    
    getTotalInfected() {
        return this.countries.reduce((sum, c) => sum + c.infected, 0);
    }
    
    getTotalDead() {
        return this.countries.reduce((sum, c) => sum + c.dead, 0);
    }
    
    getCountriesByRegion(region) {
        return this.countries.filter(c => c.region === region);
    }
    
    getInfectedCountries() {
        return this.countries.filter(c => c.infected > 0);
    }
    
    getCollapsedCountries() {
        return this.countries.filter(c => c.status === 'collapsed');
    }
    
    getHealthyCountries() {
        return this.countries.filter(c => c.status === 'healthy');
    }
    
    update(state) {
        const spreadMultiplier = state.pathogen.spreadMultiplier;
        const lethality = state.pathogen.lethality;
        
        this.countries.forEach(country => {
            if (country.infected > 0) {
                this.spreadInfection(country, spreadMultiplier);
                this.applyLethality(country, lethality);
                this.applyCountermeasures(country, state);
            }
            
            country.updateStatus();
        });
        
        this.spreadToNeighbors(state);
    }
    
    spreadInfection(country, multiplier) {
        const healthy = country.healthyPopulation;
        const infected = country.infected;
        
        if (healthy <= 0 || infected <= 0) return;
        
        const baseSpreadRate = 0.05;
        const spreadRate = baseSpreadRate * multiplier;
        const newInfected = Math.floor(infected * spreadRate * (healthy / country.population));
        
        country.infected = Math.min(country.infected + newInfected, healthy);
    }
    
    applyLethality(country, lethality) {
        if (country.infected <= 0) return;
        
        const baseDeathRate = lethality * 0.01;
        const treatmentReduction = country.treatmentQuality * 0.002;
        const actualDeathRate = Math.max(0.001, baseDeathRate - treatmentReduction);
        
        const newDeaths = Math.floor(country.infected * actualDeathRate);
        country.dead = Math.min(country.dead + newDeaths, country.infected);
        country.infected -= newDeaths;
    }
    
    applyCountermeasures(country, state) {
        if (country.infectedRate > 0.1 && country.lockdownLevel < 3) {
            const lockdownChance = 0.1 * (country.defense / 100);
            if (Math.random() < lockdownChance) {
                country.lockdownLevel++;
            }
        }
        
        if (country.infectedRate > 0.05 && country.treatmentQuality < 5) {
            const treatmentChance = 0.15 * (country.economy / 100);
            if (Math.random() < treatmentChance) {
                country.treatmentQuality++;
            }
        }
        
        const lockdownEffect = 1 - (country.lockdownLevel * 0.15);
        return lockdownEffect;
    }
    
    spreadToNeighbors(state) {
        const infectedCountries = this.getInfectedCountries();
        const healthyCountries = this.getHealthyCountries();
        
        infectedCountries.forEach(infected => {
            const spreadChance = 0.05 * state.pathogen.spreadMultiplier;
            
            healthyCountries.forEach(healthy => {
                if (this.areNeighboring(infected, healthy)) {
                    if (Math.random() < spreadChance) {
                        const initialInfected = Math.floor(infected.infected * 0.01);
                        if (initialInfected > 0) {
                            healthy.infected = initialInfected;
                        }
                    }
                }
            });
        });
    }
    
    areNeighboring(country1, country2) {
        const regionGroups = {
            'as': ['as', 'eu', 'oc'],
            'eu': ['eu', 'as', 'af'],
            'af': ['af', 'eu', 'as'],
            'na': ['na', 'sa'],
            'sa': ['sa', 'na'],
            'oc': ['oc', 'as']
        };
        
        const neighbors = regionGroups[country1.region] || [];
        return neighbors.includes(country2.region);
    }
    
    infectCountry(countryId, initialInfected) {
        const country = this.getCountryById(countryId);
        if (country && country.status === 'healthy') {
            country.infected = initialInfected || Math.floor(country.population * 0.001);
            country.updateStatus();
            return true;
        }
        return false;
    }
}

export { Country, CountrySystem };
export default CountrySystem;
