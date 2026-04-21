/* ============================================
   ゲームエンジン - 状態管理・コアロジック
   ============================================ */

const GameEngine = {
    // ゲーム状態
    state: {
        currentScreen: 'title',
        year: 1,          // 1〜3年
        month: 4,         // 4月スタート
        week: 1,          // 月内の週
        turn: 0,          // 総ターン数
        phase: 'adv',     // 'adv' or 'training'
        scenarioIndex: 0,
        currentScenario: null,
        messageIndex: 0,
        isTyping: false,
        waitingForChoice: false,
        backlog: [],
        unlockedCGs: [],
        endingReached: null,

        // プレイヤーパラメータ
        player: {
            name: '主人公',
            study: 10,      // 学力
            sports: 10,     // 運動
            culture: 10,    // 文化・教養
            charm: 10,      // 魅力
            stamina: 50,    // 体力
        },

        // ヒロイン好感度
        affection: {
            sakuragi: 0,    // 桜木 彩華
            fumino: 0,      // 文野 栞
            hinata: 0,      // 日向 陽葵
        },

        // メガネ状態
        glasses: {
            obtained: false,   // メガネを入手済みか
            wearing: true,     // 現在着用しているか（入手後はデフォルトtrue）
        },

        // フラグ管理
        flags: {},
    },

    // 初期化
    init() {
        this.resetState();
    },

    resetState() {
        this.state = {
            currentScreen: 'title',
            year: 1,
            month: 4,
            week: 1,
            turn: 0,
            phase: 'adv',
            scenarioIndex: 0,
            currentScenario: null,
            messageIndex: 0,
            isTyping: false,
            waitingForChoice: false,
            backlog: [],
            unlockedCGs: [],
            endingReached: null,
            player: {
                name: '主人公',
                study: 10,
                sports: 10,
                culture: 10,
                charm: 10,
                stamina: 50,
            },
            affection: {
                sakuragi: 0,
                fumino: 0,
                hinata: 0,
            },
            glasses: {
                obtained: false,
                wearing: true,
            },
            flags: {},
        };
    },

    // 日付を進める
    advanceTime() {
        this.state.turn++;
        this.state.week++;
        if (this.state.week > 4) {
            this.state.week = 1;
            this.state.month++;
            if (this.state.month > 3 && this.state.month < 4) {
                // 学年末処理
            }
            if (this.state.month > 12) {
                this.state.month = 1;
            }
            // 年度替わり（3月→4月）
            if (this.state.month === 4 && this.state.turn > 1) {
                this.state.year++;
                if (this.state.year > 3) {
                    // 卒業処理
                    return 'graduation';
                }
            }
        }
        return 'continue';
    },

    // 日付表示文字列
    getDateString() {
        const yearNames = ['', '1年生', '2年生', '3年生'];
        const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        return `${yearNames[this.state.year]} ${monthNames[this.state.month]} 第${this.state.week}週`;
    },

    // 季節を取得
    getSeason() {
        const m = this.state.month;
        if (m >= 4 && m <= 6) return 'spring';
        if (m >= 7 && m <= 9) return 'summer';
        if (m >= 10 && m <= 11) return 'autumn';
        return 'winter';
    },

    // 学期を取得
    getTerm() {
        const m = this.state.month;
        if (m >= 4 && m <= 7) return '1学期';
        if (m >= 8 && m <= 8) return '夏休み';
        if (m >= 9 && m <= 12) return '2学期';
        return '3学期';
    },

    // パラメータ変更
    modifyParam(param, amount) {
        if (this.state.player[param] !== undefined) {
            this.state.player[param] = Math.max(0, Math.min(100, this.state.player[param] + amount));
        }
    },

    // 好感度変更
    modifyAffection(heroine, amount) {
        if (this.state.affection[heroine] !== undefined) {
            this.state.affection[heroine] = Math.max(0, Math.min(100, this.state.affection[heroine] + amount));
        }
    },

    // フラグ設定
    setFlag(flag, value) {
        this.state.flags[flag] = value === undefined ? true : value;
    },

    // フラグ取得
    getFlag(flag) {
        return this.state.flags[flag] || false;
    },

    // CG解放
    unlockCG(cgId) {
        if (!this.state.unlockedCGs.includes(cgId)) {
            this.state.unlockedCGs.push(cgId);
        }
    },

    // 次のイベントを取得
    getNextEvent() {
        const { year, month, week } = this.state;
        const events = ScenarioData.getEventsForTime(year, month, week, this.state);
        return events;
    },

    // 好感度が最も高いヒロインを取得
    getTopHeroine() {
        const aff = this.state.affection;
        let top = 'sakuragi';
        let max = aff.sakuragi;
        if (aff.fumino > max) { top = 'fumino'; max = aff.fumino; }
        if (aff.hinata > max) { top = 'hinata'; max = aff.hinata; }
        return { id: top, affection: max };
    },

    // メガネを入手する
    obtainGlasses() {
        this.state.glasses.obtained = true;
        this.state.glasses.wearing = true;
        this.setFlag('glasses_obtained');
    },

    // メガネを外す（エンディング演出用）
    removeGlasses() {
        this.state.glasses.wearing = false;
        this.setFlag('glasses_removed');
    },

    // エンディング判定
    checkEnding() {
        const top = this.getTopHeroine();
        if (top.affection >= 80) {
            return { type: 'true', heroine: top.id };
        } else if (top.affection >= 50) {
            return { type: 'good', heroine: top.id };
        } else if (top.affection >= 30) {
            return { type: 'normal', heroine: top.id };
        }
        return { type: 'bad', heroine: null };
    },

    // セーブ
    saveGame(slot) {
        const saveData = JSON.parse(JSON.stringify(this.state));
        saveData.saveDate = new Date().toLocaleString('ja-JP');
        localStorage.setItem(`lovestory_save_${slot}`, JSON.stringify(saveData));
    },

    // ロード
    loadGame(slot) {
        const data = localStorage.getItem(`lovestory_save_${slot}`);
        if (data) {
            this.state = JSON.parse(data);
            return true;
        }
        return false;
    },

    // セーブデータ取得
    getSaveData(slot) {
        const data = localStorage.getItem(`lovestory_save_${slot}`);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    },

    // ギャラリーデータ保存
    saveGallery() {
        localStorage.setItem('lovestory_gallery', JSON.stringify(this.state.unlockedCGs));
    },

    loadGallery() {
        const data = localStorage.getItem('lovestory_gallery');
        if (data) {
            return JSON.parse(data);
        }
        return [];
    },
};
