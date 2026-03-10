class Country {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.population = data.population;
        this.x = data.x;
        this.y = data.y;
        this.region = data.region;
        this.defense = data.defense;
        this.economy = data.economy;
        
        this.infected = 0;
        this.dead = 0;
        this.status = 'healthy';
    }

    get infectedRate() {
        return this.population > 0 ? this.infected / this.population : 0;
    }

    get deadRate() {
        return this.population > 0 ? this.dead / this.population : 0;
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
}

const CountryManager = (function() {
    const countries = [
        { id: 'cn', name: '中国', population: 1400000000, x: 450, y: 180, region: 'as', defense: 85, economy: 95 },
        { id: 'in', name: '印度', population: 1380000000, x: 400, y: 220, region: 'as', defense: 70, economy: 75 },
        { id: 'us', name: '美国', population: 331000000, x: 150, y: 180, region: 'na', defense: 90, economy: 100 },
        { id: 'id', name: '印度尼西亚', population: 273500000, x: 480, y: 280, region: 'as', defense: 65, economy: 70 },
        { id: 'pk', name: '巴基斯坦', population: 220900000, x: 370, y: 200, region: 'as', defense: 60, economy: 55 },
        { id: 'br', name: '巴西', population: 212600000, x: 220, y: 320, region: 'sa', defense: 75, economy: 80 },
        { id: 'ng', name: '尼日利亚', population: 206100000, x: 300, y: 270, region: 'af', defense: 50, economy: 50 },
        { id: 'bd', name: '孟加拉国', population: 164700000, x: 410, y: 210, region: 'as', defense: 65, economy: 55 },
        { id: 'ru', name: '俄罗斯', population: 144100000, x: 380, y: 100, region: 'ru', defense: 80, economy: 65 },
        { id: 'mx', name: '墨西哥', population: 128900000, x: 130, y: 220, region: 'na', defense: 70, economy: 70 },
        { id: 'jp', name: '日本', population: 126500000, x: 500, y: 170, region: 'as', defense: 95, economy: 90 },
        { id: 'et', name: '埃塞俄比亚', population: 115000000, x: 350, y: 270, region: 'af', defense: 45, economy: 40 },
        { id: 'ph', name: '菲律宾', population: 109600000, x: 480, y: 250, region: 'as', defense: 65, economy: 60 },
        { id: 'eg', name: '埃及', population: 102300000, x: 330, y: 220, region: 'af', defense: 60, economy: 55 },
        { id: 'vn', name: '越南', population: 97300000, x: 460, y: 230, region: 'as', defense: 70, economy: 60 },
        { id: 'dr', name: '刚果民主共和国', population: 89560000, x: 320, y: 300, region: 'af', defense: 40, economy: 35 },
        { id: 'tr', name: '土耳其', population: 84340000, x: 340, y: 180, region: 'eu', defense: 75, economy: 70 },
        { id: 'ir', name: '伊朗', population: 83990000, x: 360, y: 200, region: 'as', defense: 70, economy: 55 },
        { id: 'de', name: '德国', population: 83780000, x: 310, y: 140, region: 'eu', defense: 90, economy: 90 },
        { id: 'th', name: '泰国', population: 69800000, x: 450, y: 240, region: 'as', defense: 70, economy: 65 },
        { id: 'gb', name: '英国', population: 67890000, x: 280, y: 130, region: 'eu', defense: 85, economy: 85 },
        { id: 'fr', name: '法国', population: 67390000, x: 290, y: 150, region: 'eu', defense: 85, economy: 85 },
        { id: 'it', name: '意大利', population: 60460000, x: 320, y: 160, region: 'eu', defense: 80, economy: 80 },
        { id: 'za', name: '南非', population: 59310000, x: 320, y: 360, region: 'af', defense: 65, economy: 60 },
        { id: 'kr', name: '韩国', population: 51270000, x: 490, y: 175, region: 'as', defense: 90, economy: 85 },
        { id: 'es', name: '西班牙', population: 46750000, x: 270, y: 170, region: 'eu', defense: 80, economy: 80 },
        { id: 'ar', name: '阿根廷', population: 45200000, x: 200, y: 380, region: 'sa', defense: 70, economy: 65 },
        { id: 'ca', name: '加拿大', population: 38000000, x: 130, y: 100, region: 'na', defense: 85, economy: 85 },
        { id: 'au', name: '澳大利亚', population: 25490000, x: 520, y: 350, region: 'as', defense: 80, economy: 80 },
        { id: 'nl', name: '荷兰', population: 17440000, x: 300, y: 135, region: 'eu', defense: 85, economy: 85 }
    ];

    const countryInstances = countries.map(data => new Country(data));

    return {
        getCountries() {
            return countryInstances;
        },

        getCountryById(id) {
            return countryInstances.find(c => c.id === id);
        },

        getTotalPopulation() {
            return countryInstances.reduce((sum, c) => sum + c.population, 0);
        },

        getTotalInfected() {
            return countryInstances.reduce((sum, c) => sum + c.infected, 0);
        },

        getTotalDead() {
            return countryInstances.reduce((sum, c) => sum + c.dead, 0);
        },

        getCountriesByRegion(region) {
            return countryInstances.filter(c => c.region === region);
        },

        getInfectedCountries() {
            return countryInstances.filter(c => c.infected > 0);
        },

        getCollapsedCountries() {
            return countryInstances.filter(c => c.status === 'collapsed');
        }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Country, CountryManager };
}
