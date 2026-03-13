class InputHandler {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.callbacks = {};
        this.inputElement = null;
    }
    
    init(inputId) {
        this.inputElement = document.getElementById(inputId);
        if (!this.inputElement) {
            console.error('InputHandler: Input element not found');
            return false;
        }
        
        this.bindEvents();
        return true;
    }
    
    bindEvents() {
        if (!this.inputElement) return;
        
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = this.inputElement.value.trim();
                if (command) {
                    this.handleCommand(command);
                    this.inputElement.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
    }
    
    handleCommand(command) {
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        
        if (this.callbacks.onCommand) {
            this.callbacks.onCommand(command);
        }
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
        }
        
        if (this.historyIndex < this.commandHistory.length) {
            this.inputElement.value = this.commandHistory[this.historyIndex];
        } else {
            this.inputElement.value = '';
        }
    }
    
    on(event, callback) {
        this.callbacks[event] = callback;
    }
    
    off(event) {
        delete this.callbacks[event];
    }
    
    enable() {
        if (this.inputElement) {
            this.inputElement.disabled = false;
            this.inputElement.focus();
        }
    }
    
    disable() {
        if (this.inputElement) {
            this.inputElement.disabled = true;
        }
    }
    
    focus() {
        if (this.inputElement) {
            this.inputElement.focus();
        }
    }
    
    setValue(value) {
        if (this.inputElement) {
            this.inputElement.value = value;
        }
    }
    
    getValue() {
        return this.inputElement ? this.inputElement.value.trim() : '';
    }
    
    clear() {
        if (this.inputElement) {
            this.inputElement.value = '';
        }
    }
    
    clearHistory() {
        this.commandHistory = [];
        this.historyIndex = -1;
    }
}

export default InputHandler;
