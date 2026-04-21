/* ============================================
   UI マネージャー
   ============================================ */

const UI = {
    currentTypingTimer: null,
    typeSpeed: 30,

    // ── 画面切り替え ──────────────────────────────
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
        GameEngine.state.currentScreen = screenId;
    },

    async fadeToScreen(screenId, duration = 500) {
        const overlay = document.createElement('div');
        overlay.className = 'fade-overlay';
        document.body.appendChild(overlay);
        await new Promise(r => setTimeout(r, 50));
        overlay.classList.add('active');
        await new Promise(r => setTimeout(r, duration));
        this.showScreen(screenId);
        overlay.classList.remove('active');
        await new Promise(r => setTimeout(r, duration));
        overlay.remove();
    },

    // ── タイトル画面 ──────────────────────────────
    initTitle() {
        this.showScreen('title-screen');
        this.createSakuraPetals('sakura-title', 25);
    },

    createSakuraPetals(containerId, count) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDuration = (Math.random() * 5 + 5) + 's';
            petal.style.animationDelay = (Math.random() * 10) + 's';
            const size = (Math.random() * 8 + 8) + 'px';
            petal.style.width = size;
            petal.style.height = size;
            petal.style.opacity = Math.random() * 0.5 + 0.3;
            container.appendChild(petal);
        }
    },

    // ── メガネ HUD ────────────────────────────────
    updateGlassesHUD() {
        const hud = document.getElementById('glasses-hud');
        const readings = document.getElementById('glasses-readings');
        if (!hud || !readings) return;

        const g = GameEngine.state.glasses;
        if (!g.obtained || !g.wearing) {
            hud.classList.remove('active');
            return;
        }

        hud.classList.add('active');

        const heroines = [
            { key: 'sakuragi', name: '彩華', color: '#FF80AB' },
            { key: 'fumino',   name: '栞',   color: '#90CAF9' },
            { key: 'hinata',   name: '陽葵', color: '#FFB74D' },
        ];

        readings.innerHTML = heroines.map(h => {
            const val = GameEngine.state.affection[h.key];
            return `
                <div class="glasses-reading-item">
                    <span class="glasses-reading-name" style="color:${h.color}">${h.name}</span>
                    <div class="glasses-reading-bar">
                        <div class="glasses-reading-fill" style="width:${val}%;background:${h.color};"></div>
                    </div>
                    <span class="glasses-reading-num">${val}</span>
                </div>`;
        }).join('');
    },

    // メガネを外すアニメーション演出
    async playGlassesOffAnimation() {
        const bg = document.getElementById('adv-bg');
        // 全体に白フラッシュ→彩度落ち
        bg.classList.add('glasses-off-anim');
        await new Promise(r => setTimeout(r, 1200));
        bg.classList.remove('glasses-off-anim');
        // 外した後は少し落ち着いた色味に
        bg.classList.add('glasses-removed');
        // HUDを隠す
        document.getElementById('glasses-hud').classList.remove('active');
    },

    // ── ADVパート ────────────────────────────────
    async startADV(scenario) {
        GameEngine.state.currentScenario = scenario;
        GameEngine.state.messageIndex = 0;
        GameEngine.state._choiceNext = null;
        GameEngine.state.phase = 'adv';

        const advBg = document.getElementById('adv-bg');
        // クラスをリセット（グラデーション背景）
        advBg.className = 'adv-bg';
        advBg.classList.remove('glasses-removed');
        // 既存の背景画像だけ除去（テキストウィンドウ等の子要素は保持）
        advBg.querySelectorAll('.adv-bg-img').forEach(el => el.remove());

        if (scenario.bg) {
            advBg.classList.add(scenario.bg);
            // 画像ファイルがあれば最背面に挿入
            const bgMeta = Characters.bgMeta[scenario.bg];
            if (bgMeta && bgMeta.file) {
                const img = document.createElement('img');
                img.src = `images/backgrounds/${bgMeta.file}`;
                img.className = 'adv-bg-img';
                img.onerror = () => img.remove();
                advBg.insertBefore(img, advBg.firstChild);
            }
        }

        this.hideAllCharacters();
        this.hideCG();
        this.updateGlassesHUD();

        await this.fadeToScreen('adv-screen');
        this.showNextMessage();
    },

    showNextMessage() {
        const scenario = GameEngine.state.currentScenario;
        if (!scenario) return;

        const messages = scenario.messages;
        let idx = GameEngine.state.messageIndex;

        if (idx >= messages.length) {
            this.endScenario();
            return;
        }

        const msg = messages[idx];

        // 分岐ジャンプ: IDあり && 対象ID以外はスキップ
        if (msg.id && GameEngine.state._choiceNext && msg.id !== GameEngine.state._choiceNext) {
            GameEngine.state.messageIndex++;
            this.showNextMessage();
            return;
        }
        // IDなしメッセージに到達 = 分岐収束
        if (!msg.id && GameEngine.state._choiceNext) {
            GameEngine.state._choiceNext = null;
        }

        // 選択肢
        if (msg.choices) {
            this.showChoices(msg.choices);
            return;
        }

        // ── メガネを外す演出 ──
        if (msg.glassesOff) {
            GameEngine.removeGlasses();
            this.playGlassesOffAnimation().then(() => {
                // 演出完了後に次のメッセージへ自動進行
                GameEngine.state.messageIndex++;
                this.showNextMessage();
            });
            return; // クリック待ちではなく演出後に自動進行
        }

        // CG表示
        if (msg.cg) this.showCG(msg.cg);

        // キャラクター表示
        if (msg.charId) {
            this.showCharacter(msg.charId, msg.expression || 'normal', msg.position || 'center');
        } else {
            this.hideAllCharacters();
        }

        // テキスト表示
        const speakerEl = document.getElementById('speaker-name');
        const textEl    = document.getElementById('message-text');
        const indicator = document.getElementById('click-indicator');

        speakerEl.textContent = msg.speaker || '';
        indicator.classList.add('hidden');

        if (msg.text) {
            GameEngine.state.backlog.push({ speaker: msg.speaker || '', text: msg.text });
        }

        this.typeText(textEl, msg.text || '', () => {
            indicator.classList.remove('hidden');
        });
    },

    typeText(element, text, onComplete) {
        if (this.currentTypingTimer) clearInterval(this.currentTypingTimer);
        element.textContent = '';
        GameEngine.state.isTyping = true;
        let i = 0;

        if (!text.length) {
            GameEngine.state.isTyping = false;
            onComplete?.();
            return;
        }

        this.currentTypingTimer = setInterval(() => {
            element.textContent += text[i++];
            if (i >= text.length) {
                clearInterval(this.currentTypingTimer);
                this.currentTypingTimer = null;
                GameEngine.state.isTyping = false;
                onComplete?.();
            }
        }, this.typeSpeed);

        this._currentFullText    = text;
        this._currentElement     = element;
        this._currentOnComplete  = onComplete;
    },

    skipTypeText() {
        if (GameEngine.state.isTyping && this.currentTypingTimer) {
            clearInterval(this.currentTypingTimer);
            this.currentTypingTimer = null;
            this._currentElement.textContent = this._currentFullText;
            GameEngine.state.isTyping = false;
            this._currentOnComplete?.();
        }
    },

    // ── 選択肢 ────────────────────────────────────
    showChoices(choices) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        container.classList.add('active');
        GameEngine.state.waitingForChoice = true;
        document.getElementById('text-window').style.opacity = '0.3';

        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => this.selectChoice(choice));
            container.appendChild(btn);
        });
    },

    selectChoice(choice) {
        document.getElementById('choices-container').classList.remove('active');
        document.getElementById('choices-container').innerHTML = '';
        GameEngine.state.waitingForChoice = false;
        document.getElementById('text-window').style.opacity = '1';

        if (choice.effects) {
            for (const [key, val] of Object.entries(choice.effects)) {
                if (GameEngine.state.affection[key] !== undefined)  GameEngine.modifyAffection(key, val);
                else if (GameEngine.state.player[key] !== undefined) GameEngine.modifyParam(key, val);
            }
        }
        if (choice.flag)  GameEngine.setFlag(choice.flag);
        if (choice.next)  GameEngine.state._choiceNext = choice.next;

        // HUD更新（好感度変動後）
        this.updateGlassesHUD();

        GameEngine.state.messageIndex++;
        this.showNextMessage();
    },

    // ── キャラクター表示 ──────────────────────────
    showCharacter(charId, expression, position) {
        this.hideAllCharacters();
        const posMap = { left: 'char-left', center: 'char-center', right: 'char-right' };
        const el = document.getElementById(posMap[position] || 'char-center');
        if (el) {
            el.innerHTML = Characters.drawCharacter(charId, expression);
            el.classList.add('visible');
        }
    },

    hideAllCharacters() {
        document.querySelectorAll('.character-sprite').forEach(el => {
            el.classList.remove('visible');
            el.innerHTML = '';
        });
    },

    // ── CG ───────────────────────────────────────
    showCG(cgId) {
        const el = document.getElementById('event-cg');
        el.innerHTML = Characters.drawEventCG(cgId);
        el.classList.add('active');
        GameEngine.unlockCG(cgId);
        GameEngine.saveGallery();
    },

    hideCG() {
        const el = document.getElementById('event-cg');
        el.classList.remove('active');
        el.innerHTML = '';
    },

    // ── シナリオ終了 ──────────────────────────────
    endScenario() {
        const scenario = GameEngine.state.currentScenario;
        scenario?.onComplete?.();

        this.hideAllCharacters();
        this.hideCG();
        GameEngine.state.currentScenario = null;
        GameEngine.state._choiceNext = null;

        if (scenario?.isEnding) {
            this.startEndingSequence();
            return;
        }

        this.startTraining();
    },

    // ── 育成パート ────────────────────────────────
    async startTraining() {
        GameEngine.state.phase = 'training';
        this.updateTrainingScreen();
        await this.fadeToScreen('training-screen');
    },

    updateTrainingScreen() {
        document.getElementById('training-date').textContent   = GameEngine.getDateString();
        document.getElementById('training-period').textContent = GameEngine.getTerm();
        this.renderStatsPanel();
        this.renderActions();
        this.renderWeeklyEvents();
    },

    renderStatsPanel() {
        const state = GameEngine.state;
        const panel = document.getElementById('stats-panel');

        const stats = [
            { key: 'study',   name: '学力', cls: 'study' },
            { key: 'sports',  name: '運動', cls: 'sports' },
            { key: 'culture', name: '文化', cls: 'culture' },
            { key: 'charm',   name: '魅力', cls: 'charm' },
            { key: 'stamina', name: '体力', cls: 'stamina' },
        ];

        let html = '<h3>パラメータ</h3>';
        for (const s of stats) {
            html += `
                <div class="stat-item">
                    <div class="stat-label"><span>${s.name}</span><span>${state.player[s.key]}</span></div>
                    <div class="stat-bar">
                        <div class="stat-bar-fill ${s.cls}" style="width:${state.player[s.key]}%"></div>
                    </div>
                </div>`;
        }

        html += '<div class="affection-section"><h4>好感度</h4>';
        const heroines = [
            { key: 'sakuragi', name: '彩華', color: '#FF80AB' },
            { key: 'fumino',   name: '栞',   color: '#90CAF9' },
            { key: 'hinata',   name: '陽葵', color: '#FFB74D' },
        ];

        // メガネ入手前は「???」で隠す
        const glassesObtained = state.glasses.obtained;

        for (const h of heroines) {
            const aff    = state.affection[h.key];
            const hearts = Math.floor(aff / 10);
            const displayNum = glassesObtained ? aff : '?';

            html += `
                <div class="affection-item">
                    <span class="affection-name" style="color:${h.color}">${h.name}</span>
                    <div class="affection-hearts">
                        ${Array.from({length:10},(_,i) =>
                            `<span class="heart ${(glassesObtained && i < hearts) ? 'filled':''}" style="${(glassesObtained && i < hearts) ? `color:${h.color}`:''}">&hearts;</span>`
                        ).join('')}
                    </div>
                    <span style="font-size:0.75rem;margin-left:4px;color:${h.color}">${displayNum}</span>
                </div>`;
        }
        html += '</div>';

        // メガネ入手前は注釈表示
        if (!glassesObtained) {
            html += `<p style="font-size:0.7rem;color:#aaa;text-align:center;margin-top:0.5rem;">※まだメガネを持っていない</p>`;
        }

        panel.innerHTML = html;
    },

    renderActions() {
        const grid = document.getElementById('action-grid');
        grid.innerHTML = '';
        for (const action of TrainingSystem.actions) {
            const card = document.createElement('div');
            card.className = 'action-card';
            card.innerHTML = `
                <div class="action-icon">${action.icon}</div>
                <div class="action-name">${action.name}</div>
                <div class="action-desc">${action.desc}</div>
                <div class="action-effect">${action.effect}</div>`;
            card.addEventListener('click', () => this.executeTrainingAction(action.id));
            grid.appendChild(card);
        }
    },

    renderWeeklyEvents() {
        const el = document.getElementById('weekly-events');
        const nextEvent = GameEngine.getNextEvent();
        el.innerHTML = nextEvent
            ? `<div class="event-notice">イベント予定あり！</div>`
            : `<div class="event-notice" style="border-color:#aaa;color:#888;">特になし</div>`;
    },

    async executeTrainingAction(actionId) {
        const result = TrainingSystem.executeAction(actionId);
        if (!result) return;

        await this.showParamPopup(result);

        // 怪我・風邪時はヒロイン遭遇なし
        if (!result.noEncounter && !result.forcedRest) {
            const encounter = TrainingSystem.checkRandomEncounter();
            if (encounter) await this.showEncounterPopup(encounter);
        }

        // HUD更新
        this.updateGlassesHUD();

        const timeResult = GameEngine.advanceTime();

        if (timeResult === 'graduation') {
            const gradEvent = ScenarioData.fixedEvents['y3_m3_w2'][0];
            this.startADV(gradEvent);
            return;
        }

        const nextEvent = GameEngine.getNextEvent();
        if (nextEvent) {
            await this.startADV(nextEvent);
        } else {
            this.updateTrainingScreen();
        }
    },

    showParamPopup(result) {
        return new Promise(resolve => {
            const popup = document.createElement('div');
            popup.className = 'param-popup';

            // 失敗タイプ別アイコン・色
            const typeStyle = {
                injury: { icon: '🤕', color: '#ff6b6b' },
                cold:   { icon: '🤒', color: '#64b5f6' },
                fail:   { icon: '😓', color: '#ffb74d' },
            };
            const ts = typeStyle[result.type] || { icon: '✨', color: 'var(--accent-pink)' };

            let html = `<h3 style="color:${ts.color}">${ts.icon} ${result.message}</h3>`;
            for (const r of result.results) {
                const cls  = r.change > 0 ? 'up' : 'down';
                const sign = r.change > 0 ? '+' : '';
                html += `<div class="param-change">${r.param} <span class="${cls}">${sign}${r.change}</span></div>`;
            }
            html += `<button class="close-btn">OK</button>`;
            popup.innerHTML = html;
            document.body.appendChild(popup);
            popup.querySelector('.close-btn').addEventListener('click', () => { popup.remove(); resolve(); });
        });
    },

    showEncounterPopup(encounter) {
        return new Promise(resolve => {
            const heroine = Characters.heroines[encounter.heroineId];
            const popup   = document.createElement('div');
            popup.className = 'param-popup';
            popup.innerHTML = `
                <h3 style="color:${heroine.color}">${heroine.nameShort}との遭遇</h3>
                <p style="margin:1rem 0;line-height:1.6;color:rgba(255,255,255,0.9);">${encounter.text}</p>
                <div class="param-change">${heroine.nameShort}の好感度 <span class="up">+${encounter.affection}</span></div>
                <button class="close-btn">OK</button>`;
            document.body.appendChild(popup);
            popup.querySelector('.close-btn').addEventListener('click', () => { popup.remove(); resolve(); });
        });
    },

    // ── エンディング ──────────────────────────────
    async startEndingSequence() {
        const ending = GameEngine.checkEnding();
        let endingData;

        if (ending.type === 'bad') {
            endingData = ScenarioData.endings.bad;
        } else {
            endingData = ScenarioData.endings[ending.heroine][ending.type];
        }

        if (endingData.cgBefore) {
            GameEngine.unlockCG(endingData.cgBefore);
            GameEngine.saveGallery();
        }
        if (endingData.cgAfter) {
            GameEngine.unlockCG(endingData.cgAfter);
            GameEngine.saveGallery();
        }

        const endScene = {
            bg: 'bg-graduation',
            messages: endingData.messages,
            isEndingScene: true,
            endingData,
            endingType: ending.type,
            endingHeroine: ending.heroine,
            onComplete: () => {},
        };

        GameEngine.state.currentScenario = endScene;
        GameEngine.state.messageIndex = 0;
        await this.startADV(endScene);
    },

    showEndingCard(endingData, endingType, heroine) {
        const content = document.getElementById('ending-content');
        const bg      = document.getElementById('ending-bg');

        let bgStyle = 'background:linear-gradient(180deg,#1a0a2e 0%,#2d1b4e 50%,#4a1a6b 100%);';
        let heroineNameHTML = '';

        if (heroine) {
            const h = Characters.heroines[heroine];
            heroineNameHTML = `<div class="ending-heroine-name" style="color:${h.color}">${h.name}</div>`;
            if (heroine === 'sakuragi') bgStyle = 'background:linear-gradient(180deg,#1a0a2e 0%,#880E4F 50%,#FCE4EC 100%);';
            if (heroine === 'fumino')   bgStyle = 'background:linear-gradient(180deg,#0d0221 0%,#1565C0 50%,#E3F2FD 100%);';
            if (heroine === 'hinata')   bgStyle = 'background:linear-gradient(180deg,#1a0a2e 0%,#E65100 50%,#FFF3E0 100%);';
        }

        bg.setAttribute('style', bgStyle);

        const typeLabels = { true: 'TRUE END', good: 'GOOD END', normal: 'NORMAL END', bad: 'END' };
        content.innerHTML = `
            ${heroineNameHTML}
            <div class="ending-label">${typeLabels[endingType] || 'END'}</div>
            <div class="ending-text">${endingData.title}</div>
            <button class="ending-btn" id="btn-ending-title">タイトルに戻る</button>`;

        this.showScreen('ending-screen');
        document.getElementById('btn-ending-title').addEventListener('click', () => {
            GameEngine.resetState();
            this.initTitle();
        });
    },

    // ── ステータス画面 ────────────────────────────
    showStatus() {
        const state = GameEngine.state;

        const stats = [
            { key:'study',   name:'学力', color:'#42A5F5' },
            { key:'sports',  name:'運動', color:'#66BB6A' },
            { key:'culture', name:'文化', color:'#FFA726' },
            { key:'charm',   name:'魅力', color:'#EC407A' },
            { key:'stamina', name:'体力', color:'#AB47BC' },
        ];

        let html = `<h3>プレイヤー</h3><p style="color:rgba(255,255,255,0.6);margin-bottom:1rem;font-size:0.9rem;">${GameEngine.getDateString()}</p>`;
        for (const s of stats) {
            html += `
                <div class="status-stat-item">
                    <div class="status-stat-label"><span>${s.name}</span><span>${state.player[s.key]} / 100</span></div>
                    <div class="status-stat-bar">
                        <div class="status-stat-fill" style="width:${state.player[s.key]}%;background:${s.color};"></div>
                    </div>
                </div>`;
        }
        document.getElementById('player-stats').innerHTML = html;

        const heroines = [
            { key:'sakuragi', data: Characters.heroines.sakuragi },
            { key:'fumino',   data: Characters.heroines.fumino },
            { key:'hinata',   data: Characters.heroines.hinata },
        ];
        const glassesObtained = state.glasses.obtained;

        let hHtml = `<h3>ヒロイン</h3>`;
        if (!glassesObtained) {
            hHtml += `<p style="font-size:0.85rem;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:1rem;">メガネを入手すると好感度が見えるようになる</p>`;
        }
        for (const h of heroines) {
            const aff    = state.affection[h.key];
            const hearts = Math.floor(aff / 10);
            const level  = aff>=80?'大好き':aff>=50?'好意':aff>=30?'友達':aff>=10?'知り合い':'他人';

            hHtml += `
                <div class="heroine-card">
                    <div class="heroine-card-name" style="color:${h.data.color}">${h.data.name}</div>
                    <div class="heroine-card-hearts">
                        ${Array.from({length:10},(_,i) =>
                            `<span class="heart ${(glassesObtained && i<hearts)?'filled':''}" style="${(glassesObtained && i<hearts)?`color:${h.data.color}`:''}">&#9829;</span>`
                        ).join('')}
                    </div>
                    <div class="heroine-card-level">関係性：${glassesObtained ? level : '???'}</div>
                </div>`;
        }
        document.getElementById('heroine-affection').innerHTML = hHtml;

        this.showScreen('status-screen');
    },

    // ── セーブ/ロード ─────────────────────────────
    showSaveLoad(mode) {
        document.getElementById('saveload-title').textContent = mode === 'save' ? 'セーブ' : 'ロード';

        // 初回オープン時のみ戻り先を記録（スロット保存後の再描画で上書きしない）
        if (GameEngine.state.currentScreen !== 'saveload-screen') {
            this._previousScreen = GameEngine.state.currentScreen;
        }

        const container = document.getElementById('save-slots');
        container.innerHTML = '';
        const yearNames = ['','1年生','2年生','3年生'];

        for (let i = 1; i <= 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'save-slot';
            const data = GameEngine.getSaveData(i);

            slot.innerHTML = data ? `
                <div class="save-slot-title">スロット ${i}</div>
                <div class="save-slot-info">
                    ${yearNames[data.year]||''} ${data.month}月 第${data.week}週<br>
                    学力:${data.player.study} 運動:${data.player.sports}<br>
                    ${data.saveDate || ''}
                </div>` : `
                <div class="save-slot-title">スロット ${i}</div>
                <div class="save-slot-empty">空きスロット</div>`;

            slot.addEventListener('click', () => {
                if (mode === 'save') {
                    GameEngine.saveGame(i);
                    this.showSaveLoad('save'); // 再描画（_previousScreen は上書きされない）
                } else if (GameEngine.loadGame(i)) {
                    this.closeSaveLoad();
                    this.updateGlassesHUD();
                    if (GameEngine.state.phase === 'training') this.startTraining();
                    else this.startTraining();
                }
            });
            container.appendChild(slot);
        }

        this.showScreen('saveload-screen');
    },

    closeSaveLoad() {
        if (this._previousScreen) this.showScreen(this._previousScreen);
    },

    // ── ギャラリー ────────────────────────────────
    showGallery() {
        const grid = document.getElementById('gallery-grid');
        grid.innerHTML = '';

        const allCGs = Object.entries(Characters.cgMeta).map(([id, meta]) => ({ id, title: meta.title }));
        const unlocked = GameEngine.loadGallery();

        for (const cg of allCGs) {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const isUnlocked = unlocked.includes(cg.id);

            if (isUnlocked) {
                item.innerHTML = `
                    ${Characters.drawEventCG(cg.id)}
                    <div class="gallery-item-title">${cg.title}</div>`;
                item.addEventListener('click', () => this.showGalleryCG(cg));
            } else {
                item.classList.add('locked');
                item.innerHTML = `<div class="gallery-item-title">???</div>`;
            }
            grid.appendChild(item);
        }

        this.showScreen('gallery-screen');
    },

    showGalleryCG(cg) {
        const el = document.getElementById('event-cg');
        el.innerHTML = Characters.drawEventCG(cg.id);
        el.classList.add('active');

        document.getElementById('adv-bg').className = 'adv-bg';
        document.getElementById('text-window').style.display = 'none';
        document.querySelector('.adv-ui-buttons').style.display = 'none';
        document.getElementById('glasses-hud').classList.remove('active');

        this.showScreen('adv-screen');

        const handler = () => {
            this.hideCG();
            document.getElementById('text-window').style.display = '';
            document.querySelector('.adv-ui-buttons').style.display = '';
            this.showGallery();
            el.removeEventListener('click', handler);
        };
        el.addEventListener('click', handler);
    },

    // ── バックログ ────────────────────────────────
    showBacklog() {
        const content = document.getElementById('backlog-content');
        content.innerHTML = '';
        for (const log of GameEngine.state.backlog.slice(-50)) {
            const entry = document.createElement('div');
            entry.className = 'backlog-entry';
            entry.innerHTML = `
                ${log.speaker ? `<div class="backlog-speaker">${log.speaker}</div>` : ''}
                <div class="backlog-text">${log.text}</div>`;
            content.appendChild(entry);
        }
        this._previousScreen2 = GameEngine.state.currentScreen;
        this.showScreen('backlog-screen');
        content.scrollTop = content.scrollHeight;
    },

    closeBacklog() {
        if (this._previousScreen2) this.showScreen(this._previousScreen2);
    },
};
