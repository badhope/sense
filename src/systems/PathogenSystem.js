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
        requiredTransmissions: 1
    },
    heatResistance: {
        name: '抗热性',
        desc: '适应炎热气候国家',
        icon: '🔥',
        cost: 3,
        requiredTransmissions: 1
    },
    drugResistance: {
        name: '抗药性',
        desc: '降低药物治疗效果',
        icon: '💊',
        cost: 4,
        requiredTransmissions: 2
    },
    mutation: {
        name: '快速变异',
        desc: '增加随机变异概率',
        icon: '🧬',
        cost: 5,
        requiredTransmissions: 2
    },
    stealth: {
        name: '潜伏期',
        desc: '感染初期难以被发现',
        icon: '👻',
        cost: 4,
        requiredTransmissions: 1
    }
};

const PATHOGEN_TYPES = {
    bacteria: {
        name: '细菌',
        desc: '适应性强，可快速进化抗药性',
        icon: '🦠',
        initialDNA: 2,
        spreadMultiplier: 1.2,
        lethalityMultiplier: 1.0,
        cureResistance: 1.1
    },
    virus: {
        name: '病毒',
        desc: '变异迅速，难以被疫苗克制',
        icon: '🦠',
        initialDNA: 2,
        spreadMultiplier: 1.1,
        lethalityMultiplier: 1.2,
        cureResistance: 1.3
    },
    parasite: {
        name: '寄生虫',
        desc: '存活持久，症状难以察觉',
        icon: '🪱',
        initialDNA: 2,
        spreadMultiplier: 0.9,
        lethalityMultiplier: 1.3,
        cureResistance: 1.2
    },
    fungus: {
        name: '真菌',
        desc: '环境适应力强，全球传播迅速',
        icon: '🍄',
        initialDNA: 2,
        spreadMultiplier: 1.3,
        lethalityMultiplier: 1.0,
        cureResistance: 1.1
    },
    prion: {
        name: '朊病毒',
        desc: '无法治愈，致命性极高',
        icon: '⚛️',
        initialDNA: 2,
        spreadMultiplier: 0.8,
        lethalityMultiplier: 1.5,
        cureResistance: 2.0
    }
};

class PathogenSystem {
    constructor() {
        this.transmissions = TRANSMISSIONS;
        this.symptoms = SYMPTOMS;
        this.abilities = ABILITIES;
        this.pathogenTypes = PATHOGEN_TYPES;
    }
    
    createPathogen(type) {
        const config = this.pathogenTypes[type];
        if (!config) {
            throw new Error(`Unknown pathogen type: ${type}`);
        }
        
        return {
            type,
            dna: config.initialDNA,
            transmissions: {},
            symptoms: {},
            abilities: {},
            spreadMultiplier: config.spreadMultiplier,
            lethalityMultiplier: config.lethalityMultiplier,
            cureResistance: config.cureResistance,
            mutationRate: 0.01
        };
    }
    
    canUpgradeTransmission(state, transmissionType) {
        const currentLevel = state.pathogen.transmissions[transmissionType] || 0;
        const config = this.transmissions[transmissionType];
        
        if (!config || currentLevel >= config.maxLevel) {
            return false;
        }
        
        const cost = config.costs[currentLevel];
        return state.pathogen.dna >= cost;
    }
    
    upgradeTransmission(state, transmissionType) {
        if (!this.canUpgradeTransmission(state, transmissionType)) {
            return { success: false, message: '无法升级' };
        }
        
        const currentLevel = state.pathogen.transmissions[transmissionType] || 0;
        const config = this.transmissions[transmissionType];
        const cost = config.costs[currentLevel];
        
        state.pathogen.dna -= cost;
        state.pathogen.transmissions[transmissionType] = currentLevel + 1;
        state.pathogen.spreadMultiplier += config.effects[currentLevel];
        
        return {
            success: true,
            message: `升级${config.name}到等级${currentLevel + 1}`,
            level: currentLevel + 1
        };
    }
    
    canUpgradeSymptom(state, symptomType) {
        if (state.pathogen.symptoms[symptomType]) {
            return false;
        }
        
        const config = this.symptoms[symptomType];
        if (!config) return false;
        
        if (state.pathogen.dna < config.cost) {
            return false;
        }
        
        const transmissionCount = Object.keys(state.pathogen.transmissions).length;
        if (transmissionCount < config.requiredTransmissions) {
            return false;
        }
        
        return true;
    }
    
    upgradeSymptom(state, symptomType) {
        if (!this.canUpgradeSymptom(state, symptomType)) {
            return { success: false, message: '无法升级症状' };
        }
        
        const config = this.symptoms[symptomType];
        state.pathogen.dna -= config.cost;
        state.pathogen.symptoms[symptomType] = true;
        state.pathogen.spreadMultiplier += config.infectBonus;
        state.pathogen.lethality += config.lethality;
        
        return {
            success: true,
            message: `获得症状：${config.name}`
        };
    }
    
    canUpgradeAbility(state, abilityType) {
        if (state.pathogen.abilities[abilityType]) {
            return false;
        }
        
        const config = this.abilities[abilityType];
        if (!config) return false;
        
        if (state.pathogen.dna < config.cost) {
            return false;
        }
        
        const transmissionCount = Object.keys(state.pathogen.transmissions).length;
        if (transmissionCount < config.requiredTransmissions) {
            return false;
        }
        
        return true;
    }
    
    upgradeAbility(state, abilityType) {
        if (!this.canUpgradeAbility(state, abilityType)) {
            return { success: false, message: '无法升级能力' };
        }
        
        const config = this.abilities[abilityType];
        state.pathogen.dna -= config.cost;
        state.pathogen.abilities[abilityType] = true;
        
        if (abilityType === 'mutation') {
            state.pathogen.mutationRate += 0.05;
        }
        
        return {
            success: true,
            message: `获得能力：${config.name}`
        };
    }
    
    update(state) {
        const totalInfected = state.countries.reduce((sum, c) => sum + c.infected, 0);
        const totalPopulation = state.countries.reduce((sum, c) => sum + c.population, 0);
        
        const infectionRate = totalPopulation > 0 ? totalInfected / totalPopulation : 0;
        
        const dnaPerTurn = Math.max(1, Math.floor(infectionRate * 10));
        state.pathogen.dna += dnaPerTurn;
        
        state.globalInfected = totalInfected;
        state.totalPopulation = totalPopulation;
    }
    
    getSpreadMultiplier(state) {
        return state.pathogen.spreadMultiplier;
    }
    
    getLethality(state) {
        return state.pathogen.lethality;
    }
}

export default PathogenSystem;
