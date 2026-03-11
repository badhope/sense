class UIManager {
    constructor() {
        this.screens = {};
        this.selectedPathogen = null;
        this.initialized = false;
        this.isMobile = window.innerWidth <= 768;
    }

    init() {
        this.screens = {
            start: document.getElementById('start-screen'),
            pathogenSelect: document.getElementById('pathogen-select'),
            game: document.getElementById('game-screen')
        };
        
        this.selectedPathogen = null;
        this.initEventListeners();
        this.initResponsiveListeners();
        this.initMapControls();
        this.initialized = true;
    }

    initEventListeners() {
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            window.soundManager?.playClick();
            this.showScreen('pathogenSelect');
        });

        const pathogenCards = document.querySelectorAll('.pathogen-card');
        pathogenCards.forEach(card => {
            card.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.selectPathogen(card);
            });
        });

        const confirmBtn = document.getElementById('confirm-pathogen');
        confirmBtn.addEventListener('click', () => {
            if (this.selectedPathogen) {
                window.soundManager?.playBuy();
                this.startGame(this.selectedPathogen);
            }
        });

        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => {
            window.soundManager?.playClick();
            this.restartGame();
        });

        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.switchTab(btn.dataset.tab);
            });
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    selectPathogen(card) {
        document.querySelectorAll('.pathogen-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
        this.selectedPathogen = card.dataset.type;
        
        const confirmBtn = document.getElementById('confirm-pathogen');
        confirmBtn.disabled = false;
    }

    startGame(pathogenType) {
        this.showScreen('game');
        if (window.game) {
            window.game.init(pathogenType);
        }
    }

    restartGame() {
        document.getElementById('game-over-modal').classList.remove('active');
        document.getElementById('story-modal')?.classList.remove('active');
        document.getElementById('event-modal')?.classList.remove('active');
        window.game.reset();
        this.showScreen('pathogenSelect');
        this.selectedPathogen = null;
        document.querySelectorAll('.pathogen-card').forEach(c => {
            c.classList.remove('selected');
        });
        document.getElementById('confirm-pathogen').disabled = true;
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    initResponsiveListeners() {
        const collapsePanelBtn = document.getElementById('collapse-panel');
        const controlPanel = document.getElementById('control-panel');
        if (collapsePanelBtn && controlPanel) {
            collapsePanelBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                controlPanel.classList.toggle('collapsed');
            });
        }

        const toggleStatsBtn = document.getElementById('toggle-stats');
        const statsPanel = document.getElementById('stats-panel');
        if (toggleStatsBtn && statsPanel) {
            toggleStatsBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                statsPanel.classList.toggle('collapsed');
            });
        }

        const toggleEventsBtn = document.getElementById('toggle-events');
        const eventLogContainer = document.querySelector('.event-log-container');
        if (toggleEventsBtn && eventLogContainer) {
            toggleEventsBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                eventLogContainer.classList.toggle('collapsed');
                const isCollapsed = eventLogContainer.classList.contains('collapsed');
                toggleEventsBtn.textContent = isCollapsed ? '事件日志 ▲' : '事件日志 ▼';
            });
        }

        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle && this.isMobile) {
            menuToggle.addEventListener('click', () => {
                window.soundManager?.playClick();
                controlPanel.classList.toggle('mobile-visible');
            });
        }

        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            if (!this.isMobile) {
                controlPanel?.classList.remove('mobile-visible');
            }
        });
    }

    initMapControls() {
        const svg = document.getElementById('world-map');
        const container = document.getElementById('map-container');
        if (!svg || !container) return;

        this.mapScale = 1;
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;

        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const zoomReset = document.getElementById('zoom-reset');

        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.zoomMap(1.2);
            });
        }

        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.zoomMap(0.8);
            });
        }

        if (zoomReset) {
            zoomReset.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.resetMap();
            });
        }

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.country')) return;
            this.isDragging = true;
            this.startX = e.clientX - this.mapPanX;
            this.startY = e.clientY - this.mapPanY;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.mapPanX = e.clientX - this.startX;
            this.mapPanY = e.clientY - this.startY;
            this.applyMapTransform();
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoomMap(delta);
        }, { passive: false });
    }

    zoomMap(factor) {
        this.mapScale *= factor;
        this.mapScale = Math.max(0.5, Math.min(3, this.mapScale));
        this.applyMapTransform();
    }

    resetMap() {
        this.mapScale = 1;
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.applyMapTransform();
    }

    applyMapTransform() {
        const svg = document.getElementById('world-map');
        if (svg) {
            svg.style.transform = `scale(${this.mapScale}) translate(${this.mapPanX / this.mapScale}px, ${this.mapPanY / this.mapScale}px)`;
        }
    }

    updatePathogenInfo(pathogen) {
        document.getElementById('pathogen-name').textContent = pathogen.name;
        document.getElementById('pathogen-type').textContent = this.getPathogenTypeName(pathogen.type);
        
        const nameEl = document.getElementById('pathogen-name');
        nameEl.style.color = pathogen.color || 'var(--accent-green)';
        nameEl.style.textShadow = `0 0 20px ${pathogen.color || 'var(--accent-green)'}`;
    }

    getPathogenTypeName(type) {
        const names = {
            bacteria: '细菌',
            virus: '病毒',
            parasite: '寄生虫',
            fungus: '真菌',
            prion: '朊病毒'
        };
        return names[type] || type;
    }

    updateDNA(dna) {
        const dnaEl = document.getElementById('dna-value');
        dnaEl.textContent = dna;
        dnaEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            dnaEl.style.transform = 'scale(1)';
        }, 200);
    }

    updateInfectionRate(rate) {
        const percent = Math.floor(rate * 100);
        document.getElementById('infection-percent').textContent = `${percent}%`;
        document.getElementById('infection-fill').style.width = `${percent}%`;
    }

    updateStats(game) {
        const totalPop = CountryManager.getTotalPopulation();
        const infected = CountryManager.getTotalInfected();
        const dead = CountryManager.getTotalDead();
        
        document.getElementById('total-population').textContent = this.formatNumber(totalPop);
        document.getElementById('infected-count').textContent = this.formatNumber(infected);
        
        const deadEl = document.getElementById('dead-count');
        deadEl.textContent = this.formatNumber(dead);
        
        document.getElementById('cure-rate').textContent = `${Math.floor(game.cureRate * 1000)}%`;
    }

    updateTurn(turn) {
        let turnEl = document.getElementById('turn-indicator');
        if (!turnEl) {
            turnEl = document.createElement('div');
            turnEl.id = 'turn-indicator';
            turnEl.className = 'turn-indicator';
            turnEl.innerHTML = '回合 <span>0</span>';
            document.getElementById('game-screen').appendChild(turnEl);
        }
        turnEl.querySelector('span').textContent = turn;
    }

    renderTransmissionList(pathogen) {
        const container = document.getElementById('transmission-list');
        container.innerHTML = '';

        for (const [type, config] of Object.entries(TRANSMISSIONS)) {
            const currentLevel = pathogen.transmissions[type] || 0;
            const cost = pathogen.getTransmissionCost(type);
            const canBuy = pathogen.dna >= cost && pathogen.canBuyTransmission(type);
            const isMaxed = currentLevel >= config.maxLevel;
            const isOwned = currentLevel > 0;

            const item = document.createElement('div');
            item.className = `upgrade-item ${!canBuy && !isMaxed ? 'disabled' : ''} ${isMaxed ? 'maxed' : ''} ${isOwned ? 'owned' : ''}`;
            
            let levelDots = '';
            for (let i = 0; i < config.maxLevel; i++) {
                levelDots += `<span class="level-dot ${i < currentLevel ? (isMaxed ? 'gold' : 'filled') : ''}"></span>`;
            }

            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${config.icon || ''} ${config.name}</span>
                    <span class="upgrade-cost">${isMaxed ? 'MAX' : cost + ' DNA'}</span>
                </div>
                <div class="upgrade-desc">${config.desc}</div>
                <div class="upgrade-level">${levelDots}</div>
            `;

            if (canBuy) {
                item.addEventListener('click', () => {
                    if (window.game.buyTransmission(type)) {
                        window.soundManager?.playBuy();
                        this.renderTransmissionList(window.game.pathogen);
                        this.updateDNA(window.game.pathogen.dna);
                    } else {
                        window.soundManager?.playError();
                    }
                });
            }

            container.appendChild(item);
        }
    }

    renderSymptomsList(pathogen) {
        const container = document.getElementById('symptoms-list');
        container.innerHTML = '';

        for (const [symptom, config] of Object.entries(SYMPTOMS)) {
            const owned = !!pathogen.symptoms[symptom];
            const canBuy = pathogen.dna >= config.cost && pathogen.canBuySymptom(symptom);
            const requiredText = config.requiredTransmissions > 0 ? 
                `需要 ${config.requiredTransmissions} 个传播途径` : '';

            const item = document.createElement('div');
            item.className = `upgrade-item ${owned ? 'owned' : ''} ${!canBuy && !owned ? 'disabled' : ''}`;
            
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${config.icon || ''} ${config.name}</span>
                    <span class="upgrade-cost">${owned ? '已解锁' : config.cost + ' DNA'}</span>
                </div>
                <div class="upgrade-desc">${config.desc}</div>
                ${requiredText ? `<div class="upgrade-desc" style="color: var(--accent-red); font-size: 0.75rem;">🔒 ${requiredText}</div>` : ''}
            `;

            if (canBuy) {
                item.addEventListener('click', () => {
                    if (window.game.buySymptom(symptom)) {
                        window.soundManager?.playMutation();
                        this.renderSymptomsList(window.game.pathogen);
                        this.renderAbilitiesList(window.game.pathogen);
                        this.updateDNA(window.game.pathogen.dna);
                    } else {
                        window.soundManager?.playError();
                    }
                });
            }

            container.appendChild(item);
        }
    }

    renderAbilitiesList(pathogen) {
        const container = document.getElementById('abilities-list');
        container.innerHTML = '';

        for (const [ability, config] of Object.entries(ABILITIES)) {
            const owned = pathogen.abilities.includes(ability);
            const canBuy = pathogen.dna >= config.cost && pathogen.canBuyAbility(ability);
            const requiredText = config.requiredTransmissions > 0 ? 
                `需要 ${config.requiredTransmissions} 个传播途径` : '';

            const item = document.createElement('div');
            item.className = `upgrade-item ${owned ? 'owned' : ''} ${!canBuy && !owned ? 'disabled' : ''}`;
            
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${config.icon || ''} ${config.name}</span>
                    <span class="upgrade-cost">${owned ? '已解锁' : config.cost + ' DNA'}</span>
                </div>
                <div class="upgrade-desc">${config.desc}</div>
                ${requiredText ? `<div class="upgrade-desc" style="color: var(--accent-red); font-size: 0.75rem;">🔒 ${requiredText}</div>` : ''}
            `;

            if (canBuy) {
                item.addEventListener('click', () => {
                    if (window.game.buyAbility(ability)) {
                        window.soundManager?.playBuy();
                        this.renderAbilitiesList(window.game.pathogen);
                        this.updateDNA(window.game.pathogen.dna);
                    } else {
                        window.soundManager?.playError();
                    }
                });
            }

            container.appendChild(item);
        }
    }

    renderWorldMap(countries) {
        const svg = document.getElementById('world-map');
        svg.innerHTML = '';

        countries.forEach(country => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'country');
            group.setAttribute('data-id', country.id);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', country.x);
            circle.setAttribute('cy', country.y);
            circle.setAttribute('r', this.getCountryRadius(country.population));
            circle.setAttribute('class', this.getCountryClass(country.status));

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', country.x);
            label.setAttribute('y', country.y + 4);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', country.status === 'healthy' ? '#7a8ba3' : '#fff');
            label.setAttribute('font-size', '10');
            label.textContent = country.name.substring(0, 2);

            group.appendChild(circle);
            group.appendChild(label);

            group.addEventListener('mouseenter', (e) => this.showCountryTooltip(country, e));
            group.addEventListener('mousemove', (e) => this.moveTooltip(e));
            group.addEventListener('mouseleave', () => this.hideCountryTooltip());

            svg.appendChild(group);
        });
    }

    updateWorldMap(countries) {
        countries.forEach(country => {
            const group = document.querySelector(`.country[data-id="${country.id}"]`);
            if (group) {
                const circle = group.querySelector('circle');
                const oldStatus = circle.getAttribute('class').split(' ').find(c => 
                    c === 'healthy' || c === 'infected' || c === 'collapsed');
                
                circle.setAttribute('class', this.getCountryClass(country.status));
                
                if (country.status !== 'healthy' && oldStatus === 'healthy') {
                    circle.style.animation = 'none';
                    circle.offsetHeight;
                    circle.style.animation = 'pulseRing 1s ease-out';
                    window.soundManager?.playInfect();
                }
                
                if (country.status === 'collapsed' && oldStatus !== 'collapsed') {
                    group.style.animation = 'none';
                    group.offsetHeight;
                    group.style.animation = 'shake 0.5s ease';
                }
            }
        });
    }

    getCountryRadius(population) {
        const minR = 8;
        const maxR = 30;
        const minPop = 25000000;
        const maxPop = 1400000000;
        
        const normalized = (population - minPop) / (maxPop - minPop);
        return minR + normalized * (maxR - minR);
    }

    getCountryClass(status) {
        switch (status) {
            case 'healthy': return 'country-healthy';
            case 'infected': return 'country-infected';
            case 'collapsed': return 'country-collapsed';
            case 'quarantined': return 'country-infected';
            default: return 'country-healthy';
        }
    }

    showCountryTooltip(country, event) {
        let tooltip = document.getElementById('country-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'country-tooltip';
            document.body.appendChild(tooltip);
        }

        const infectedPercent = country.infectedRate > 0 ? 
            `${(country.infectedRate * 100).toFixed(1)}%` : '0%';
        const deadPercent = country.deadRate > 0 ? 
            `${(country.deadRate * 100).toFixed(1)}%` : '0%';

        tooltip.innerHTML = `
            <div class="tooltip-header">${country.name}</div>
            <div class="tooltip-row"><span>人口:</span><span>${this.formatNumber(country.population)}</span></div>
            <div class="tooltip-row"><span>感染:</span><span>${infectedPercent}</span></div>
            <div class="tooltip-row"><span>死亡:</span><span>${deadPercent}</span></div>
            <div class="tooltip-row"><span>状态:</span><span>${this.getStatusText(country.status)}</span></div>
            <div class="tooltip-row"><span>防控:</span><span>${country.defense}%</span></div>
        `;

        tooltip.style.display = 'block';
        this.moveTooltip(event);
    }

    moveTooltip(event) {
        const tooltip = document.getElementById('country-tooltip');
        if (!tooltip) return;
        
        const x = event.clientX + 15;
        const y = event.clientY + 15;
        
        const rect = tooltip.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 10;
        const maxY = window.innerHeight - rect.height - 10;
        
        tooltip.style.left = Math.min(x, maxX) + 'px';
        tooltip.style.top = Math.min(y, maxY) + 'px';
    }

    hideCountryTooltip() {
        const tooltip = document.getElementById('country-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    getStatusText(status) {
        const statusMap = {
            'healthy': '未感染',
            'infected': '感染中',
            'collapsed': '沦陷',
            'quarantined': '隔离中'
        };
        return statusMap[status] || status;
    }

    addEventLog(message, type = 'info') {
        const container = document.getElementById('event-log');
        const event = document.createElement('div');
        event.className = `event-item ${type}`;
        event.innerHTML = `<span class="event-time">${new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', second:'2-digit'})}</span> ${message}`;
        
        container.insertBefore(event, container.firstChild);

        if (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }

        if (type === 'danger' || type === 'warning') {
            event.style.animation = 'eventShake 0.5s ease';
            if (window.soundManager) {
                window.soundManager.playPop();
            }
        } else if (type === 'success') {
            event.style.animation = 'eventSlide 0.3s ease';
        }
    }

    showPathogenStory(story) {
        let modal = document.getElementById('story-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'story-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content story-modal">
                <button class="modal-close" onclick="this.parentElement.parentElement.classList.remove('active')">×</button>
                <h2 class="story-title">${story.title}</h2>
                <p class="story-intro">${story.description}</p>
                <div class="story-backdrop">
                    <h3>起源</h3>
                    <p>${story.backstory}</p>
                </div>
                <div class="story-characteristics">
                    <h3>特性</h3>
                    <ul>
                        ${story.characteristics.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
                <div class="story-strategy">
                    <h3>策略提示</h3>
                    <p>${story.strategy}</p>
                </div>
                <button class="btn-primary" onclick="document.getElementById('story-modal').classList.remove('active')">开始游戏</button>
            </div>
        `;

        modal.classList.add('active');
    }

    showCountryEvent(countryName, eventType, message) {
        let modal = document.getElementById('event-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'event-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        const titles = {
            'firstReport': '📢 首次报告',
            'lockdown': '🔒 封城措施',
            'crisis': '⚠️ 危机升级',
            'collapse': '💀 国家沦陷'
        };

        modal.innerHTML = `
            <div class="modal-content event-modal">
                <button class="modal-close" onclick="this.parentElement.parentElement.classList.remove('active')">×</button>
                <h2 class="event-title">${titles[eventType] || '事件'}</h2>
                <h3 class="event-country">${countryName}</h3>
                <p class="event-message">${message}</p>
                <button class="btn-primary" onclick="document.getElementById('event-modal').classList.remove('active')">继续</button>
            </div>
        `;

        modal.classList.add('active');

        setTimeout(() => {
            modal.classList.remove('active');
        }, 5000);
    }

    showGameOver(isVictory, stats, ending = null) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');

        if (ending) {
            title.textContent = ending.title;
            message.innerHTML = `${ending.message}<br><br><em>${ending.epilogue}</em>`;
            
            if (isVictory) {
                title.className = 'victory';
            } else {
                title.className = 'defeat';
            }
        } else {
            if (isVictory) {
                title.textContent = '🏆 世界已被征服！';
                title.className = 'victory';
                message.textContent = '恭喜！你成功让病原体感染了全世界的每一个人类！';
            } else {
                title.textContent = '💀 人类获胜';
                title.className = 'defeat';
                message.textContent = '很遗憾，人类成功研发出疫苗并治愈了所有人...';
            }
        }

        document.getElementById('final-countries').textContent = stats.countries;
        document.getElementById('final-deaths').textContent = this.formatNumber(stats.deaths);
        document.getElementById('final-turns').textContent = stats.turns;

        modal.classList.add('active');
    }

    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager };
}
