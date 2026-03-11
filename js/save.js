class SaveManager {
    static SAVE_KEY = 'pathogen_inc_save';
    static SETTINGS_KEY = 'pathogen_inc_settings';

    static saveGame(gameState) {
        try {
            const saveData = {
                version: '1.1',
                timestamp: Date.now(),
                pathogen: gameState.pathogen ? {
                    type: gameState.pathogen.type,
                    name: gameState.pathogen.name,
                    dna: gameState.pathogen.dna,
                    transmissions: gameState.pathogen.transmissions,
                    symptoms: gameState.pathogen.symptoms,
                    abilities: gameState.pathogen.abilities,
                    turn: gameState.pathogen.turn
                } : null,
                countries: gameState.countries.map(c => ({
                    id: c.id,
                    name: c.name,
                    infected: c.infected,
                    dead: c.dead,
                    status: c.status,
                    defense: c.defense
                })),
                game: {
                    turn: gameState.turn,
                    dnaPerTurn: gameState.dnaPerTurn,
                    cureRate: gameState.cureRate,
                    isPaused: gameState.isPaused,
                    gameSpeed: gameState.gameSpeed
                }
            };

            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return { success: true, message: '游戏已保存' };
        } catch (error) {
            console.error('Save failed:', error);
            return { success: false, message: '保存失败: ' + error.message };
        }
    }

    static loadGame() {
        try {
            const saved = localStorage.getItem(this.SAVE_KEY);
            if (!saved) {
                return { success: false, message: '没有找到存档' };
            }

            const saveData = JSON.parse(saved);

            if (!saveData.version || !saveData.pathogen || !saveData.countries) {
                return { success: false, message: '存档数据不完整' };
            }

            return { success: true, data: saveData };
        } catch (error) {
            console.error('Load failed:', error);
            return { success: false, message: '读取存档失败: ' + error.message };
        }
    }

    static hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }

    static deleteSave() {
        localStorage.removeItem(this.SAVE_KEY);
    }

    static getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }

    static saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch {
            return false;
        }
    }

    static getDefaultSettings() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            animationsEnabled: true,
            showTooltips: true,
            autoSave: true
        };
    }

    static getSaveInfo() {
        try {
            const saved = localStorage.getItem(this.SAVE_KEY);
            if (!saved) return null;

            const data = JSON.parse(saved);
            return {
                version: data.version,
                timestamp: data.timestamp,
                pathogenType: data.pathogen?.name || '未知',
                turn: data.game?.turn || 0
            };
        } catch {
            return null;
        }
    }
}

window.SaveManager = SaveManager;
