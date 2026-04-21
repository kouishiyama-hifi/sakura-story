/* ============================================
   育成システム
   ============================================ */

const TrainingSystem = {
    // 行動定義
    actions: [
        {
            id: 'study',
            name: '勉強する',
            icon: '📚',
            desc: '図書室や教室で勉強',
            effect: '学力UP',
            execute(state) {
                const gain = 3 + Math.floor(Math.random() * 3);
                state.player.study = Math.min(100, state.player.study + gain);
                state.player.stamina = Math.max(0, state.player.stamina - 5);
                const results = [{ param: '学力', change: gain }];
                // 文野と会えることがある
                if (Math.random() < 0.35) {
                    state.affection.fumino = Math.min(100, state.affection.fumino + 2);
                    results.push({ param: '栞の好感度', change: 2 });
                }
                return { message: '集中して勉強した！', results };
            }
        },
        {
            id: 'sports',
            name: '運動する',
            icon: '⚽',
            desc: 'グラウンドで汗を流す',
            effect: '運動UP',
            execute(state) {
                const gain = 3 + Math.floor(Math.random() * 3);
                state.player.sports = Math.min(100, state.player.sports + gain);
                state.player.stamina = Math.max(0, state.player.stamina - 8);
                const results = [{ param: '運動', change: gain }];
                // 日向と会えることがある
                if (Math.random() < 0.4) {
                    state.affection.hinata = Math.min(100, state.affection.hinata + 2);
                    results.push({ param: '陽葵の好感度', change: 2 });
                }
                return { message: 'いい汗をかいた！', results };
            }
        },
        {
            id: 'culture',
            name: '文化活動',
            icon: '🎨',
            desc: '芸術や音楽に触れる',
            effect: '文化UP',
            execute(state) {
                const gain = 3 + Math.floor(Math.random() * 3);
                state.player.culture = Math.min(100, state.player.culture + gain);
                state.player.stamina = Math.max(0, state.player.stamina - 4);
                const results = [{ param: '文化', change: gain }];
                // 桜木と会えることがある
                if (Math.random() < 0.3) {
                    state.affection.sakuragi = Math.min(100, state.affection.sakuragi + 2);
                    results.push({ param: '彩華の好感度', change: 2 });
                }
                return { message: '感性が磨かれた！', results };
            }
        },
        {
            id: 'charm',
            name: 'おしゃれ',
            icon: '✨',
            desc: '身だしなみを整える',
            effect: '魅力UP',
            execute(state) {
                const gain = 3 + Math.floor(Math.random() * 3);
                state.player.charm = Math.min(100, state.player.charm + gain);
                state.player.stamina = Math.max(0, state.player.stamina - 3);
                return { message: '魅力がアップした！', results: [{ param: '魅力', change: gain }] };
            }
        },
        {
            id: 'rest',
            name: '休息する',
            icon: '😴',
            desc: '家でゆっくり休む',
            effect: '体力回復',
            execute(state) {
                const gain = 15 + Math.floor(Math.random() * 10);
                state.player.stamina = Math.min(100, state.player.stamina + gain);
                return { message: 'ゆっくり休めた！', results: [{ param: '体力', change: gain }] };
            }
        },
        {
            id: 'parttime',
            name: 'アルバイト',
            icon: '💰',
            desc: 'いろんな経験を積む',
            effect: '魅力&運動UP',
            execute(state) {
                const charmGain = 2;
                const sportsGain = 1;
                state.player.charm = Math.min(100, state.player.charm + charmGain);
                state.player.sports = Math.min(100, state.player.sports + sportsGain);
                state.player.stamina = Math.max(0, state.player.stamina - 10);
                return {
                    message: 'アルバイトで色々な経験をした！',
                    results: [
                        { param: '魅力', change: charmGain },
                        { param: '運動', change: sportsGain }
                    ]
                };
            }
        },
    ],

    // 行動を実行
    executeAction(actionId) {
        const action = this.actions.find(a => a.id === actionId);
        if (!action) return null;

        const state = GameEngine.state;

        // 体力チェック（10以下は強制休息）
        if (actionId !== 'rest' && state.player.stamina < 10) {
            return {
                message: '体力が足りない……少し休んだほうがいいかも。',
                results: [],
                forcedRest: true,
            };
        }

        // 失敗判定（体力50%以下で確率発生）
        const failure = this.checkFailure(state, actionId);
        if (failure) return failure;

        return action.execute(state);
    },

    // ── 失敗判定 ──────────────────────────────────
    checkFailure(state, actionId) {
        if (actionId === 'rest') return null; // 休息は失敗なし

        const stamina = state.player.stamina;
        if (stamina > 50) return null; // 体力50超は失敗なし

        // 失敗確率: 体力50→0%, 体力25→25%, 体力0→50%
        const failChance = ((50 - stamina) / 50) * 0.5;
        if (Math.random() >= failChance) return null; // 成功

        // ── 運動 → 怪我 ──
        if (actionId === 'sports') {
            const sportsLoss  = 2 + Math.floor(Math.random() * 4); // 2〜5
            const staminaLoss = 10 + Math.floor(Math.random() * 6); // 10〜15
            state.player.sports  = Math.max(0, state.player.sports  - sportsLoss);
            state.player.stamina = Math.max(0, state.player.stamina - staminaLoss);
            return {
                type: 'injury',
                message: '練習中に怪我をしてしまった……無理は禁物だ。',
                results: [
                    { param: '運動', change: -sportsLoss },
                    { param: '体力', change: -staminaLoss },
                ],
                noEncounter: true,
            };
        }

        // ── 勉強・文化 → 風邪（一定確率）、それ以外 → 集中できず ──
        const paramMap = {
            study:    { name: '学力', key: 'study' },
            culture:  { name: '文化', key: 'culture' },
            charm:    { name: '魅力', key: 'charm' },
            parttime: { name: '魅力', key: 'charm' },
        };
        const param  = paramMap[actionId] || { name: '学力', key: 'study' };
        const isCold = (actionId === 'study' || actionId === 'culture') && Math.random() < 0.4;

        if (isCold) {
            const paramLoss   = 1 + Math.floor(Math.random() * 3); // 1〜3
            const staminaLoss = 15 + Math.floor(Math.random() * 10); // 15〜24
            state.player[param.key] = Math.max(0, state.player[param.key] - paramLoss);
            state.player.stamina    = Math.max(0, state.player.stamina    - staminaLoss);
            return {
                type: 'cold',
                message: '無理をしたせいか、風邪を引いてしまった……熱が出てきた。',
                results: [
                    { param: param.name, change: -paramLoss },
                    { param: '体力',     change: -staminaLoss },
                ],
                noEncounter: true,
            };
        }

        // 通常失敗（集中できなかった）
        const loss = 1 + Math.floor(Math.random() * 2); // 1〜2
        state.player[param.key] = Math.max(0, state.player[param.key] - loss);
        return {
            type: 'fail',
            message: '体がだるくて、うまく集中できなかった……。',
            results: [{ param: param.name, change: -loss }],
        };
    },

    // ランダムイベント判定
    checkRandomEncounter() {
        const state = GameEngine.state;
        const rand = Math.random();

        if (rand < 0.15) {
            // ランダムエンカウンター
            const heroines = ['sakuragi', 'fumino', 'hinata'];
            const chosen = heroines[Math.floor(Math.random() * heroines.length)];
            return this.getRandomEncounter(chosen);
        }
        return null;
    },

    getRandomEncounter(heroineId) {
        const encounters = {
            sakuragi: [
                {
                    text: '廊下で桜木さんとすれ違った。ふわりと良い香りがした。',
                    affection: 1,
                },
                {
                    text: '桜木さんが音楽室でピアノを弾いているのが聞こえた。美しい旋律だった。',
                    affection: 1,
                },
                {
                    text: '桜木さんが落とした教科書を拾ってあげた。「ありがとう」と微笑んでくれた。',
                    affection: 2,
                },
            ],
            fumino: [
                {
                    text: '栞が図書室でうたた寝していた。そっと毛布をかけておいた。',
                    affection: 2,
                },
                {
                    text: '栞から新しい本をおすすめされた。「きっと気に入ると思う」と嬉しそうだった。',
                    affection: 1,
                },
                {
                    text: '帰り道、栞と一緒になった。昔みたいに並んで歩いた。',
                    affection: 2,
                },
            ],
            hinata: [
                {
                    text: '日向がグラウンドで一人自主練をしていた。声をかけたら嬉しそうに笑った。',
                    affection: 2,
                },
                {
                    text: '日向が「一緒にランニングしよう！」と声をかけてきた。',
                    affection: 1,
                },
                {
                    text: '日向からスポーツドリンクをもらった。「差し入れ！」と元気な笑顔だった。',
                    affection: 2,
                },
            ],
        };

        const list = encounters[heroineId];
        const enc = list[Math.floor(Math.random() * list.length)];
        GameEngine.modifyAffection(heroineId, enc.affection);
        return {
            heroineId,
            text: enc.text,
            affection: enc.affection,
        };
    },
};
