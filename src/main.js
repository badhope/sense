import GameEngine from './core/GameEngine.js';
import TextRenderer from './ui/TextRenderer.js';
import InputHandler from './ui/InputHandler.js';
import PathogenSystem from './systems/PathogenSystem.js';
import CountrySystem from './systems/CountrySystem.js';

class Game {
    constructor() {
        this.engine = new GameEngine();
        this.renderer = new TextRenderer();
        this.inputHandler = new InputHandler();
        this.pathogenSystem = new PathogenSystem();
        this.countrySystem = new CountrySystem();
        this.currentPhase = 'start';
        this.selectedPathogen = null;
    }
    
    async init() {
        console.log('Game: Initializing...');
        
        this.renderer.init('game-output');
        this.inputHandler.init('game-input');
        
        this.setupEventListeners();
        this.showStartScreen();
        
        console.log('Game: Initialized successfully');
    }
    
    setupEventListeners() {
        this.inputHandler.on('command', (command) => {
            this.handleCommand(command);
        });
        
        this.engine.on('gameStart', (data) => {
            this.updateStatusBar();
        });
        
        this.engine.on('turnEnd', (data) => {
            this.updateStatusBar();
            this.showTurnReport();
        });
        
        this.engine.on('eventTriggered', (event) => {
            this.showEvent(event);
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelp();
        });
    }
    
    handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        switch (this.currentPhase) {
        case 'start':
            this.handleStartCommand(cmd);
            break;
        case 'pathogen_select':
            this.handlePathogenSelectCommand(cmd);
            break;
        case 'game':
            this.handleGameCommand(cmd);
            break;
        }
    }
    
    handleStartCommand(cmd) {
        if (cmd === 'start' || cmd === '开始') {
            this.showPathogenSelect();
        } else if (cmd === 'load' || cmd === '读取') {
            this.loadGame();
        } else if (cmd === 'help' || cmd === '帮助') {
            this.showStartHelp();
        } else {
            this.renderer.render('无效命令。输入 "start" 开始游戏，或 "help" 查看帮助。', { type: 'system' });
        }
    }
    
    handlePathogenSelectCommand(cmd) {
        const pathogenTypes = ['bacteria', 'virus', 'parasite', 'fungus', 'prion'];
        const typeMap = {
            '1': 'bacteria',
            '2': 'virus',
            '3': 'parasite',
            '4': 'fungus',
            '5': 'prion'
        };
        
        if (cmd === 'back' || cmd === '返回') {
            this.showStartScreen();
            return;
        }
        
        const selected = typeMap[cmd] || pathogenTypes.find(p => p.includes(cmd));
        
        if (selected && this.pathogenSystem.pathogenTypes[selected]) {
            this.startGame(selected);
        } else {
            this.renderer.render('请输入 1-5 选择病原体类型，或输入 "back" 返回', { type: 'error' });
        }
    }
    
    handleGameCommand(cmd) {
        if (cmd === 'help' || cmd === '帮助') {
            this.showGameHelp();
        } else if (cmd === 'status' || cmd === '状态') {
            this.showStatus();
        } else if (cmd === 'upgrade' || cmd === '升级') {
            this.showUpgradeOptions();
        } else if (cmd.startsWith('upgrade ')) {
            this.performUpgrade(cmd.substring(8));
        } else if (cmd === 'save' || cmd === '保存') {
            this.saveGame();
        } else if (cmd === 'load' || cmd === '读取') {
            this.loadGame();
        } else if (cmd === 'pause' || cmd === '暂停') {
            this.togglePause();
        } else {
            const choiceNum = parseInt(cmd);
            if (!isNaN(choiceNum)) {
                this.makeChoice(choiceNum - 1);
            } else {
                this.renderer.render('无效命令。输入 "help" 查看可用命令。', { type: 'system' });
            }
        }
    }
    
    showStartScreen() {
        this.renderer.clear();
        this.renderer.render('PATHOGEN INC.', { type: 'title' });
        this.renderer.render('病原体公司 - 文字互动版', { type: 'subtitle' });
        this.renderer.render('');
        this.renderer.render('你将扮演有史以来最致命的病原体，目标是感染并消灭全人类。');
        this.renderer.render('');
        this.renderer.render('输入 "start" 开始游戏', { type: 'system' });
        this.renderer.render('输入 "load" 读取存档', { type: 'system' });
        this.renderer.render('输入 "help" 查看帮助', { type: 'system' });
        
        this.currentPhase = 'start';
        this.inputHandler.focus();
    }
    
    showStartHelp() {
        this.renderer.render('=== 帮助信息 ===', { type: 'system' });
        this.renderer.render('start - 开始新游戏');
        this.renderer.render('load - 读取存档');
        this.renderer.render('help - 显示帮助');
        this.renderer.render('');
        this.renderer.render('游戏目标：感染全世界 70 亿人口，同时避免人类研发出疫苗。');
    }
    
    showPathogenSelect() {
        this.renderer.render('');
        this.renderer.render('=== 选择你的病原体 ===', { type: 'title' });
        this.renderer.render('');
        
        const pathogens = [
            { id: 'bacteria', name: '细菌', icon: '🦠', desc: '适应性强，可快速进化抗药性' },
            { id: 'virus', name: '病毒', icon: '🦠', desc: '变异迅速，难以被疫苗克制' },
            { id: 'parasite', name: '寄生虫', icon: '🪱', desc: '存活持久，症状难以察觉' },
            { id: 'fungus', name: '真菌', icon: '🍄', desc: '环境适应力强，全球传播迅速' },
            { id: 'prion', name: '朊病毒', icon: '⚛️', desc: '无法治愈，致命性极高' }
        ];
        
        pathogens.forEach((p, i) => {
            this.renderer.render(`${i + 1}. ${p.icon} ${p.name} - ${p.desc}`);
        });
        
        this.renderer.render('');
        this.renderer.render('请输入 1-5 选择病原体类型：', { type: 'system' });
        
        this.currentPhase = 'pathogen_select';
    }
    
    startGame(pathogenType) {
        this.selectedPathogen = pathogenType;
        
        const pathogenConfig = this.pathogenSystem.pathogenTypes[pathogenType];
        const pathogen = this.pathogenSystem.createPathogen(pathogenType);
        
        this.engine.state.pathogen = pathogen;
        this.engine.state.countries = this.countrySystem.getCountries();
        this.engine.state.totalPopulation = this.countrySystem.getTotalPopulation();
        
        this.engine.init({
            pathogenSystem: this.pathogenSystem,
            countrySystem: this.countrySystem
        });
        
        this.engine.start();
        
        this.renderer.render('');
        this.renderer.render('=== 游戏开始 ===', { type: 'title' });
        this.renderer.render('');
        this.renderer.render(`你选择了：${pathogenConfig.icon} ${pathogenConfig.name}`);
        this.renderer.render(pathogenConfig.desc);
        this.renderer.render('');
        this.renderer.render(`初始 DNA 点数：${pathogen.dna}`);
        this.renderer.render(`传播倍率：${pathogen.spreadMultiplier.toFixed(2)}`);
        this.renderer.render(`致命性倍率：${pathogen.lethalityMultiplier.toFixed(2)}`);
        this.renderer.render('');
        
        const startCountry = this.countrySystem.getCountryById('cn');
        this.countrySystem.infectCountry('cn', 1000);
        
        this.renderer.render(`游戏起始于：${startCountry.name}`, { type: 'success' });
        this.renderer.render('初始感染人数：1,000');
        this.renderer.render('');
        this.renderer.render('输入 "help" 查看可用命令', { type: 'system' });
        this.renderer.render('输入 "upgrade" 查看升级选项', { type: 'system' });
        
        this.currentPhase = 'game';
        this.updatePathogenInfo();
        this.updateStatusBar();
    }
    
    showTurnReport() {
        const state = this.engine.getState();
        
        this.renderer.render('');
        this.renderer.render(`--- 回合 ${state.turn} ---`, { type: 'log' });
        
        const newInfected = this.countrySystem.getTotalInfected();
        const newDead = this.countrySystem.getTotalDead();
        
        this.renderer.render(`新增感染：${newInfected.toLocaleString()}`);
        this.renderer.render(`新增死亡：${newDead.toLocaleString()}`);
        this.renderer.render(`获得 DNA: ${Math.max(1, Math.floor(newInfected / 1000000))}`);
        
        const infectedRate = (newInfected / state.totalPopulation * 100).toFixed(2);
        this.renderer.render(`全球感染率：${infectedRate}%`);
        
        this.renderer.render('');
    }
    
    showUpgradeOptions() {
        this.renderer.render('');
        this.renderer.render('=== 升级选项 ===', { type: 'title' });
        
        const state = this.engine.getState();
        const dna = state.pathogen.dna;
        
        this.renderer.render(`当前 DNA: ${dna}`, { type: 'system' });
        this.renderer.render('');
        
        this.renderer.render('传播途径 (输入 "upgrade air/water/blood/contact/animal"):');
        Object.entries(this.pathogenSystem.transmissions).forEach(([key, t]) => {
            const currentLevel = state.pathogen.transmissions[key] || 0;
            const canUpgrade = currentLevel < t.maxLevel && dna >= t.costs[currentLevel];
            const status = canUpgrade ? '✓' : '✗';
            this.renderer.render(`  ${status} ${t.icon} ${t.name} - 等级 ${currentLevel}/${t.maxLevel} (成本：${t.costs[currentLevel] || 'MAX'})`);
        });
        
        this.renderer.render('');
        this.renderer.render('症状 (输入 "upgrade symptom_name"):');
        Object.entries(this.pathogenSystem.symptoms).forEach(([key, s]) => {
            const has = state.pathogen.symptoms[key];
            const canAfford = dna >= s.cost;
            const status = has ? '✓' : (canAfford ? '○' : '✗');
            this.renderer.render(`  ${status} ${s.icon} ${s.name} - 成本：${s.cost}`);
        });
        
        this.renderer.render('');
        this.renderer.render('能力 (输入 "upgrade ability_name"):');
        Object.entries(this.pathogenSystem.abilities).forEach(([key, a]) => {
            const has = state.pathogen.abilities[key];
            const canAfford = dna >= a.cost;
            const status = has ? '✓' : (canAfford ? '○' : '✗');
            this.renderer.render(`  ${status} ${a.icon} ${a.name} - 成本：${a.cost}`);
        });
    }
    
    performUpgrade(upgradeName) {
        const state = this.engine.getState();
        const name = upgradeName.toLowerCase().trim();
        
        let result;
        
        if (this.pathogenSystem.transmissions[name]) {
            result = this.pathogenSystem.upgradeTransmission(state, name);
        } else if (this.pathogenSystem.symptoms[name]) {
            result = this.pathogenSystem.upgradeSymptom(state, name);
        } else if (this.pathogenSystem.abilities[name]) {
            result = this.pathogenSystem.upgradeAbility(state, name);
        } else {
            this.renderer.render('无效的升级选项。', { type: 'error' });
            return;
        }
        
        if (result.success) {
            this.renderer.render(result.message, { type: 'success' });
            this.updatePathogenInfo();
            this.updateStatusBar();
        } else {
            this.renderer.render(result.message, { type: 'error' });
        }
    }
    
    showStatus() {
        const state = this.engine.getState();
        
        this.renderer.render('');
        this.renderer.render('=== 当前状态 ===', { type: 'title' });
        this.renderer.render('');
        
        this.renderer.render(`病原体类型：${this.pathogenSystem.pathogenTypes[state.pathogen.type].name}`);
        this.renderer.render(`DNA 点数：${state.pathogen.dna}`);
        this.renderer.render(`传播倍率：${state.pathogen.spreadMultiplier.toFixed(2)}`);
        this.renderer.render(`致命性：${(state.pathogen.lethality * 100).toFixed(2)}%`);
        this.renderer.render('');
        
        this.renderer.render('已解锁传播途径:');
        Object.entries(state.pathogen.transmissions).forEach(([key, level]) => {
            if (level > 0) {
                const t = this.pathogenSystem.transmissions[key];
                this.renderer.render(`  ${t.icon} ${t.name}: 等级 ${level}`);
            }
        });
        
        this.renderer.render('');
        this.renderer.render('已获得症状:');
        Object.entries(state.pathogen.symptoms).forEach(([key, has]) => {
            if (has) {
                const s = this.pathogenSystem.symptoms[key];
                this.renderer.render(`  ${s.icon} ${s.name}`);
            }
        });
        
        this.renderer.render('');
        this.renderer.render('已获得能力:');
        Object.entries(state.pathogen.abilities).forEach(([key, has]) => {
            if (has) {
                const a = this.pathogenSystem.abilities[key];
                this.renderer.render(`  ${a.icon} ${a.name}`);
            }
        });
    }
    
    showGameHelp() {
        this.renderer.render('');
        this.renderer.render('=== 游戏命令 ===', { type: 'title' });
        this.renderer.render('');
        this.renderer.render('status - 查看当前状态');
        this.renderer.render('upgrade - 查看升级选项');
        this.renderer.render('upgrade [名称] - 执行升级');
        this.renderer.render('save - 保存游戏');
        this.renderer.render('load - 读取游戏');
        this.renderer.render('pause - 暂停/继续游戏');
        this.renderer.render('help - 显示帮助');
        this.renderer.render('');
        this.renderer.render('也可以使用数字快捷键选择对话选项。');
    }
    
    updatePathogenInfo() {
        const state = this.engine.getState();
        const infoPanel = document.getElementById('pathogen-info');
        
        if (infoPanel) {
            const pathogen = state.pathogen;
            const type = this.pathogenSystem.pathogenTypes[pathogen.type];
            
            infoPanel.innerHTML = `
                <p><strong>类型:</strong> ${type.name}</p>
                <p><strong>DNA:</strong> ${pathogen.dna}</p>
                <p><strong>传播:</strong> ${pathogen.spreadMultiplier.toFixed(2)}x</p>
                <p><strong>致命:</strong> ${(pathogen.lethality * 100).toFixed(1)}%</p>
            `;
        }
    }
    
    updateStatusBar() {
        const state = this.engine.getState();
        
        document.getElementById('turn-display').textContent = state.turn;
        document.getElementById('dna-display').textContent = state.pathogen.dna;
        document.getElementById('infected-display').textContent = this.countrySystem.getTotalInfected().toLocaleString();
        document.getElementById('dead-display').textContent = this.countrySystem.getTotalDead().toLocaleString();
        document.getElementById('cure-display').textContent = `${(state.cureProgress * 100).toFixed(1)}%`;
    }
    
    saveGame() {
        const result = this.engine.saveGame();
        if (result.success) {
            this.renderer.render(result.message, { type: 'success' });
        } else {
            this.renderer.render(result.message, { type: 'error' });
        }
    }
    
    loadGame() {
        const result = this.engine.loadGame();
        if (result.success) {
            this.renderer.render('游戏读取成功', { type: 'success' });
            this.renderer.render(`回合：${result.metadata.turn}`);
            this.renderer.render(`游戏时间：${Math.floor(result.metadata.playTime / 60)}分钟`);
            this.currentPhase = 'game';
            this.updatePathogenInfo();
            this.updateStatusBar();
        } else {
            this.renderer.render(result.message, { type: 'error' });
        }
    }
    
    togglePause() {
        if (this.engine.isPaused) {
            this.engine.resume();
            this.renderer.render('游戏继续', { type: 'success' });
        } else {
            this.engine.pause();
            this.renderer.render('游戏暂停', { type: 'system' });
        }
    }
    
    makeChoice(choiceIndex) {
        const result = this.engine.makeChoice(choiceIndex);
        if (result) {
            this.renderer.render(`选择：${result.choiceText}`, { type: 'log' });
        }
    }
    
    showEvent(event) {
        if (!event) return;
        
        this.renderer.render('');
        this.renderer.render(`[事件] ${event.title || '未知事件'}`, { type: 'warning' });
        this.renderer.render(event.description || '');
        this.renderer.render('');
    }
}

const game = new Game();
window.game = game;

window.addEventListener('DOMContentLoaded', () => {
    game.init();
});

export default Game;
