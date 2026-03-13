class TextRenderer {
    constructor() {
        this.container = null;
        this.typeSpeed = 30;
        this.isTyping = false;
        this.typeTimeout = null;
    }
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('TextRenderer: Container not found');
            return false;
        }
        return true;
    }
    
    render(text, options = {}) {
        if (!this.container) {
            console.error('TextRenderer not initialized');
            return;
        }
        
        const {
            type = 'normal',
            animated = false,
            className = '',
            onComplete = null
        } = options;
        
        const element = this.createElement(text, type, className);
        
        if (animated) {
            this.typeText(element, text, onComplete);
        } else {
            element.innerHTML = this.parseMarkdown(text);
            this.container.appendChild(element);
            if (onComplete) onComplete();
        }
        
        this.scrollToBottom();
        return element;
    }
    
    createElement(text, type, className) {
        const element = document.createElement('div');
        element.className = `text-element text-${type} ${className}`;
        
        switch (type) {
        case 'title':
            element.innerHTML = `<h2 class="text-title">${this.escapeHtml(text)}</h2>`;
            break;
        case 'subtitle':
            element.innerHTML = `<h3 class="text-subtitle">${this.escapeHtml(text)}</h3>`;
            break;
        case 'dialogue':
            element.innerHTML = `<p class="text-dialogue">${this.parseMarkdown(text)}</p>`;
            break;
        case 'narration':
            element.innerHTML = `<p class="text-narration">${this.parseMarkdown(text)}</p>`;
            break;
        case 'system':
            element.innerHTML = `<p class="text-system">> ${this.escapeHtml(text)}</p>`;
            break;
        case 'error':
            element.innerHTML = `<p class="text-error">[ERROR] ${this.escapeHtml(text)}</p>`;
            break;
        case 'warning':
            element.innerHTML = `<p class="text-warning">[WARNING] ${this.escapeHtml(text)}</p>`;
            break;
        case 'success':
            element.innerHTML = `<p class="text-success">[SUCCESS] ${this.escapeHtml(text)}</p>`;
            break;
        case 'log':
            element.innerHTML = `<p class="text-log">${this.escapeHtml(text)}</p>`;
            break;
        default:
            element.innerHTML = `<p>${this.parseMarkdown(text)}</p>`;
        }
        
        return element;
    }
    
    typeText(element, text, onComplete) {
        this.isTyping = true;
        let index = 0;
        element.innerHTML = '';
        
        const type = () => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                this.typeTimeout = setTimeout(type, this.typeSpeed);
            } else {
                this.isTyping = false;
                if (onComplete) onComplete();
            }
        };
        
        type();
    }
    
    stopTyping() {
        if (this.typeTimeout) {
            clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
        }
        this.isTyping = false;
    }
    
    parseMarkdown(text) {
        let result = this.escapeHtml(text);
        
        result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
        result = result.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
        result = result.replace(/\n/g, '<br>');
        
        return result;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.stopTyping();
    }
    
    scrollToBottom() {
        if (this.container) {
            setTimeout(() => {
                this.container.scrollTop = this.container.scrollHeight;
            }, 10);
        }
    }
    
    setTypeSpeed(speed) {
        this.typeSpeed = Math.max(10, Math.min(100, speed));
    }
    
    showChoices(choices, onSelect) {
        if (!this.container) return;
        
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'choices-container';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = `${index + 1}. ${choice.text}`;
            button.onclick = () => onSelect(index, choice);
            choicesContainer.appendChild(button);
        });
        
        this.container.appendChild(choicesContainer);
        this.scrollToBottom();
    }
}

export default TextRenderer;
