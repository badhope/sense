const TRANSMISSIONS = {
    air: {
        name: '空气传播',
        desc: '通过呼吸道传播',
        icon: '💨',
        costs: [1, 2, 3],
        effects: [0.05, 0.12, 0.25],
        maxLevel: 3
    },
    water: {
        name: '水源传播',
        desc: '通过水污染传播',
        icon: '💧',
        costs: [1, 2, 3],
        effects: [0.04, 0.10, 0.20],
        maxLevel: 3
    },
    blood: {
        name: '血液传播',
        desc: '通过蚊虫叮咬传播',
        icon: '🩸',
        costs: [1, 2, 3],
        effects: [0.04, 0.09, 0.18],
        maxLevel: 3
    },
    contact: {
        name: '接触传播',
        desc: '通过身体接触传播',
        icon: '🤝',
        costs: [1, 2, 3],
        effects: [0.03, 0.08, 0.15],
        maxLevel: 3
    },
    animal: {
        name: '动物传播',
        desc: '通过动物宿主传播',
        icon: '🦟',
        costs: [2, 3, 4],
        effects: [0.03, 0.07, 0.12],
        maxLevel: 3
    }
};

const SYMPTOMS = {
    cough: {
        name: '咳嗽',
        desc: '轻微咳嗽，增加传染风险',
        icon: '😷',
        cost: 1,
        infectBonus: 0.02,
        lethality: 0.01,
        requiredTransmissions: 0
    },
    fever: {
        name: '发烧',
        desc: '发烧加速病毒传播',
        icon: '🌡️',
        cost: 2,
        infectBonus: 0.05,
        lethality: 0.02,
        requiredTransmissions: 1
    },
    vomiting: {
        name: '呕吐',
        desc: '呕吐物增加传播途径',
        icon: '🤮',
        cost: 2,
        infectBonus: 0.04,
        lethality: 0.03,
        requiredTransmissions: 1
    },
    bleeding: {
        name: '出血',
        desc: '严重症状，高致命率',
        icon: '🩹',
        cost: 3,
        infectBonus: 0.03,
        lethality: 0.08,
        requiredTransmissions: 2
    },
    immunity: {
        name: '免疫抑制',
        desc: '破坏人体免疫系统',
        icon: '💀',
        cost: 4,
        infectBonus: 0.05,
        lethality: 0.10,
        requiredTransmissions: 2
    },
    organ: {
        name: '器官衰竭',
        desc: '致命症状，全球恐慌',
        icon: '☠️',
        cost: 5,
        infectBonus: 0.08,
        lethality: 0.20,
        requiredTransmissions: 3
    }
};

const ABILITIES = {
    coldResistance: {
        name: '抗寒性',
        desc: '适应寒冷气候国家',
        icon: '❄️',
        cost: 3,
        requiredTransmissions: 1,
        regions: ['eu', 'na', 'ru']
    },
    heatResistance: {
        name: '抗热性',
        desc: '适应炎热气候国家',
        icon: '🔥',
        cost: 3,
        requiredTransmissions: 1,
        regions: ['as', 'af', 'sa']
    },
    drugResistance: {
        name: '抗药性',
        desc: '降低药物治疗效果',
        icon: '💊',
        cost: 4,
        requiredTransmissions: 2,
        regions: []
    },
    mutation: {
        name: '快速变异',
        desc: '增加随机变异概率',
        icon: '🧬',
        cost: 5,
        requiredTransmissions: 2,
        regions: []
    },
    stealth: {
        name: '潜伏期',
        desc: '感染初期难以被发现',
        icon: '👻',
        cost: 4,
        requiredTransmissions: 1,
        regions: []
    },
    resistance: {
        name: '环境抗性',
        desc: '对各种环境更具适应性',
        icon: '🛡️',
        cost: 3,
        requiredTransmissions: 2,
        regions: []
    }
};

const PATHOGEN_TYPES = {
    bacteria: {
        name: '细菌',
        type: 'bacteria',
        baseTransmission: 'air',
        baseSymptom: 'cough',
        spreadRate: 1.0,
        lethality: 0.02,
        resistance: 3,
        description: '适应性强，可快速进化抗药性',
        color: '#22c55e'
    },
    virus: {
        name: '病毒',
        type: 'virus',
        baseTransmission: 'blood',
        baseSymptom: 'fever',
        spreadRate: 1.2,
        lethality: 0.03,
        resistance: 2,
        description: '变异迅速，难以被疫苗克制',
        color: '#ef4444'
    },
    parasite: {
        name: '寄生虫',
        type: 'parasite',
        baseTransmission: 'water',
        baseSymptom: 'vomiting',
        spreadRate: 0.8,
        lethality: 0.04,
        resistance: 3,
        description: '存活持久，症状难以察觉',
        color: '#a855f7'
    },
    fungus: {
        name: '真菌',
        type: 'fungus',
        baseTransmission: 'air',
        baseSymptom: 'cough',
        spreadRate: 0.7,
        lethality: 0.03,
        resistance: 4,
        description: '生命力顽强，难以消灭',
        color: '#f97316'
    },
    prion: {
        name: '朊病毒',
        type: 'prion',
        baseTransmission: 'contact',
        baseSymptom: 'immunity',
        spreadRate: 0.5,
        lethality: 0.15,
        resistance: 5,
        description: '致命性极高，几乎无药可医',
        color: '#06b6d4'
    }
};

class Pathogen {
    constructor(type) {
        const config = PATHOGEN_TYPES[type];
        this.type = config.type;
        this.name = config.name;
        this.color = config.color;
        
        this.spreadRate = config.spreadRate;
        this.baseLethality = config.lethality;
        this.resistance = config.resistance;
        
        this.transmissions = {};
        this.transmissions[config.baseTransmission] = 1;
        
        this.symptoms = {};
        this.symptoms[config.baseSymptom] = 1;
        
        this.abilities = [];
        
        this.dna = 2;
        this.turn = 0;
        this.totalInfections = 0;
    }

    get totalTransmissions() {
        return Object.values(this.transmissions).reduce((a, b) => a + b, 0);
    }

    get totalSymptoms() {
        return Object.keys(this.symptoms).length;
    }

    get currentLethality() {
        let lethality = this.baseLethality;
        for (const [symptom, level] of Object.entries(this.symptoms)) {
            lethality += SYMPTOMS[symptom].lethality * level;
        }
        return Math.min(0.5, lethality);
    }

    get infectBonus() {
        let bonus = 0;
        for (const [symptom, level] of Object.entries(this.symptoms)) {
            bonus += SYMPTOMS[symptom].infectBonus * level;
        }
        return bonus;
    }

    get spreadMultiplier() {
        let mult = 1.0;
        for (const [trans, level] of Object.entries(this.transmissions)) {
            mult += TRANSMISSIONS[trans].effects[level - 1];
        }
        return mult * this.spreadRate;
    }

    canBuyTransmission(type) {
        const trans = TRANSMISSIONS[type];
        const currentLevel = this.transmissions[type] || 0;
        return currentLevel < trans.maxLevel;
    }

    getTransmissionCost(type) {
        const trans = TRANSMISSIONS[type];
        const currentLevel = this.transmissions[type] || 0;
        if (currentLevel >= trans.maxLevel) return Infinity;
        return trans.costs[currentLevel];
    }

    buyTransmission(type) {
        const cost = this.getTransmissionCost(type);
        if (this.dna >= cost && this.canBuyTransmission(type)) {
            this.dna -= cost;
            this.transmissions[type] = (this.transmissions[type] || 0) + 1;
            return true;
        }
        return false;
    }

    canBuySymptom(symptom) {
        const sym = SYMPTOMS[symptom];
        if (this.symptoms[symptom]) return false;
        return this.totalTransmissions >= sym.requiredTransmissions;
    }

    getSymptomCost(symptom) {
        const sym = SYMPTOMS[symptom];
        return sym.cost;
    }

    buySymptom(symptom) {
        const cost = this.getSymptomCost(symptom);
        if (this.dna >= cost && this.canBuySymptom(symptom)) {
            this.dna -= cost;
            this.symptoms[symptom] = 1;
            return true;
        }
        return false;
    }

    canBuyAbility(ability) {
        const ab = ABILITIES[ability];
        if (this.abilities.includes(ability)) return false;
        return this.totalTransmissions >= ab.requiredTransmissions;
    }

    getAbilityCost(ability) {
        return ABILITIES[ability].cost;
    }

    buyAbility(ability) {
        const cost = this.getAbilityCost(ability);
        if (this.dna >= cost && this.canBuyAbility(ability)) {
            this.dna -= cost;
            this.abilities.push(ability);
            
            if (ability === 'coldResistance') {
                this.resistance += 2;
            } else if (ability === 'heatResistance') {
                this.resistance += 2;
            } else if (ability === 'drugResistance') {
                this.resistance += 3;
            } else if (ability === 'resistance') {
                this.resistance += 2;
            } else if (ability === 'mutation') {
                this.resistance += 1;
            }
            
            return true;
        }
        return false;
    }

    getResistanceBonus(region) {
        let bonus = 0;
        if (this.abilities.includes('coldResistance') && ['eu', 'na', 'ru'].includes(region)) {
            bonus += 0.3;
        }
        if (this.abilities.includes('heatResistance') && ['as', 'af', 'sa'].includes(region)) {
            bonus += 0.3;
        }
        if (this.abilities.includes('resistance')) {
            bonus += 0.15;
        }
        return bonus;
    }

    addDNA(amount) {
        this.dna += amount;
    }

    nextTurn() {
        this.turn++;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pathogen, TRANSMISSIONS, SYMPTOMS, ABILITIES, PATHOGEN_TYPES };
}
