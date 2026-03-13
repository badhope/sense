class SaveManager {
    constructor() {
        this.VERSION = '2.0.0';
        this.STORAGE_KEY = 'pathogen_inc_save_v2';
        this.MAX_SAVES = 3;
    }
    
    saveGame(gameState) {
        const saveData = {
            version: this.VERSION,
            timestamp: Date.now(),
            turn: gameState.turn,
            playTime: this.calculatePlayTime(gameState),
            data: this.serialize(gameState),
            checksum: this.generateChecksum(gameState)
        };
        
        try {
            const saves = this.getAllSaves();
            saves.unshift(saveData);
            
            if (saves.length > this.MAX_SAVES) {
                saves.pop();
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
            
            return {
                success: true,
                message: '游戏已保存',
                saveIndex: saves.length - 1
            };
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                return {
                    success: false,
                    message: '存储空间不足，请删除旧存档'
                };
            }
            console.error('Save error:', error);
            return {
                success: false,
                message: `保存失败：${error.message}`
            };
        }
    }
    
    loadGame(index = 0) {
        try {
            const saves = this.getAllSaves();
            if (!saves[index]) {
                return { success: false, message: '存档不存在' };
            }
            
            const saveData = saves[index];
            
            if (!this.isVersionCompatible(saveData.version)) {
                return {
                    success: false,
                    message: '存档版本不兼容',
                    requiresMigration: true
                };
            }
            
            if (!this.verifyChecksum(saveData)) {
                return {
                    success: false,
                    message: '存档已损坏'
                };
            }
            
            const gameState = this.deserialize(saveData.data);
            
            return {
                success: true,
                data: gameState,
                metadata: {
                    version: saveData.version,
                    timestamp: saveData.timestamp,
                    turn: saveData.turn,
                    playTime: saveData.playTime
                }
            };
        } catch (error) {
            console.error('Load error:', error);
            return {
                success: false,
                message: `读取存档失败：${error.message}`
            };
        }
    }
    
    hasSave() {
        try {
            const saves = this.getAllSaves();
            return saves.length > 0;
        } catch (error) {
            return false;
        }
    }
    
    deleteSave(index = 0) {
        try {
            const saves = this.getAllSaves();
            if (saves[index]) {
                saves.splice(index, 1);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
            }
            return { success: true, message: '存档已删除' };
        } catch (error) {
            return { success: false, message: `删除失败：${error.message}` };
        }
    }
    
    getAllSaves() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }
    
    serialize(gameState) {
        return JSON.stringify(gameState, (key, value) => {
            if (typeof value === 'function') return undefined;
            if (key.startsWith('_')) return undefined;
            return value;
        });
    }
    
    deserialize(dataString) {
        const data = JSON.parse(dataString);
        if (this.needsMigration(data)) {
            return this.migrateData(data);
        }
        return data;
    }
    
    isVersionCompatible(version) {
        if (!version) return false;
        const [major] = version.split('.');
        const [currentMajor] = this.VERSION.split('.');
        return major === currentMajor;
    }
    
    needsMigration(data) {
        return data.version && data.version !== this.VERSION;
    }
    
    migrateData(data) {
        console.log('Migrating data from', data.version, 'to', this.VERSION);
        return data;
    }
    
    generateChecksum(gameState) {
        const data = this.serialize(gameState);
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    verifyChecksum(saveData) {
        const checksum = saveData.checksum;
        const data = saveData.data;
        const calculatedChecksum = this.generateChecksum(JSON.parse(data));
        return checksum === calculatedChecksum;
    }
    
    calculatePlayTime(gameState) {
        if (!gameState.startTime) return 0;
        return Math.floor((Date.now() - gameState.startTime) / 1000);
    }
}

export default SaveManager;
