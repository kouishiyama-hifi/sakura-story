/* ============================================
   シナリオデータ
   ============================================ */

const ScenarioData = {

    getEventsForTime(year, month, week, state) {
        const key = `y${year}_m${month}_w${week}`;
        const events = [];

        if (this.fixedEvents[key]) {
            events.push(...this.fixedEvents[key]);
        }

        for (const evt of this.affectionEvents) {
            if (evt.year === year && !state.flags[evt.flag]) {
                if (state.affection[evt.heroine] >= evt.threshold) {
                    events.push(evt);
                }
            }
        }

        const season = GameEngine.getSeason();
        if (this.seasonalEvents[`y${year}_${season}`] && !state.flags[`y${year}_${season}_done`]) {
            events.push(...this.seasonalEvents[`y${year}_${season}`]);
        }

        return events.length > 0 ? events[0] : null;
    },

    // ============================================================
    //  固定イベント
    // ============================================================
    fixedEvents: {

        // ── 1年生 4月 第1週：メガネ発見 → 入学式 ──
        'y1_m4_w1': [{
            id: 'prologue_glasses',
            title: 'プロローグ：不思議なメガネ',
            bg: 'bg-hallway',
            messages: [
                { speaker: '', text: '高校入学初日。昇降口で靴を履き替えていると、隅に何かが落ちているのに気づいた。' },
                { speaker: '', text: '埃をかぶった古いメガネケース。中には銀縁のメガネが一本。持ち主を探したが、名前もなく、手がかりもない。', cg: 'cg_glasses_found' },
                { speaker: '主人公', text: '（とりあえず持っておくか……）' },
                { speaker: '', text: '試しにかけてみると——視界は変わらない。ただ、どこかしっくりくる。' },
                { speaker: '', text: 'そのまま入学式会場に向かった。' },
                { speaker: '', text: '——桜の木の下。ふと視線を感じて顔を向けると、同じクラスになったばかりの女の子が立っていた。' },
                { speaker: '', text: 'その子の頭上に、透明な数字が浮かんでいた。', cg: 'cg_glasses_numbers' },
                { speaker: '主人公', text: '（……え？ 数字？）' },
                { speaker: '', text: '「好感度　2」——そんな文字が、ぼんやりと光っている。' },
                { speaker: '主人公', text: '（このメガネ……もしかして）' },
                { speaker: '', text: 'メガネを外してみると、数字は消えた。かけ直すと、また現れた。' },
                { speaker: '主人公', text: '（女の子の「好感度」が見える……ってこと、か？）' },
                { speaker: '', text: 'まるでゲームみたいな話だ。でも、確かに見える。' },
                { speaker: '主人公', text: '（じゃあ……これを使えば）' },
                { speaker: '', text: '胸の中で、何かが動き出した気がした。' },
            ],
            onComplete() {
                GameEngine.obtainGlasses();
                GameEngine.setFlag('prologue_glasses_done');
            }
        }],

        // ── 1年生 4月 第2週：桜木との出会い（入学式） ──
        'y1_m4_w2': [{
            id: 'prologue_main',
            title: '桜の下での出会い',
            bg: 'bg-sakura',
            messages: [
                { speaker: '', text: '入学式の後、校庭を歩いていると——' },
                { speaker: '', text: '桜の木の下に、一人の少女が佇んでいた。長い黒髪が春風に揺れている。', cg: 'cg_sakuragi_meet' },
                { speaker: '', text: 'メガネ越しに頭上を見ると、「好感度　0」の文字。当然か。' },
                { speaker: '???', text: '……何か？', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { speaker: '', text: '彼女は冷ややかな瞳でこちらを見た。' },
                { speaker: '主人公', text: 'あ、いや……桜がきれいだなって。' },
                { speaker: '???', text: '……そう。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { speaker: '', text: 'それだけ言うと、彼女は静かに歩き去っていった。' },
                { speaker: '', text: '後で知ったことだが、彼女の名は桜木彩華。学園のマドンナと呼ばれる存在だった。' },
                { speaker: '主人公', text: '（好感度 0……か。ここからだな）' },
            ],
            onComplete() {
                GameEngine.setFlag('prologue_done');
                GameEngine.modifyAffection('sakuragi', 2);
            }
        }],

        // ── 1年生 4月 第3週：幼馴染との再会 ──
        'y1_m4_w3': [{
            id: 'meet_fumino',
            title: '幼馴染との再会',
            bg: 'bg-classroom',
            messages: [
                { speaker: '', text: '教室に入ると、見覚えのある横顔が目に入った。' },
                { speaker: '主人公', text: '……栞？ 文野栞か？' },
                { speaker: '栞', text: 'あ……久しぶり……だね。', charId: 'fumino', expression: 'shy', position: 'center' },
                { speaker: '', text: 'メガネ越しに見ると「好感度　18」——昔なじみだからか、最初から高めだ。' },
                { speaker: '主人公', text: '（……18。幼馴染補正、か）' },
                { speaker: '栞', text: '同じクラスだったんだ。……嬉しい、な。', charId: 'fumino', expression: 'happy', position: 'center' },
                { speaker: '', text: '栞は相変わらず控えめで、本を大事そうに抱えていた。' },
                { speaker: '主人公', text: 'これからよろしくな、栞。' },
                { speaker: '栞', text: 'うん……よろしくね。', charId: 'fumino', expression: 'happy', position: 'center' },
            ],
            onComplete() {
                GameEngine.setFlag('meet_fumino_done');
                GameEngine.modifyAffection('fumino', 5);
            }
        }],

        // ── 1年生 4月 第4週：日向との出会い ──
        'y1_m4_w4': [{
            id: 'meet_hinata',
            title: '嵐のような出会い',
            bg: 'bg-schoolyard',
            messages: [
                { speaker: '', text: '昼休み、校庭を歩いていると——' },
                { speaker: '???', text: 'あーーーっ！ 危ない！！', charId: 'hinata', expression: 'surprised', position: 'center' },
                { speaker: '', text: 'ドンッ！ 誰かがぶつかってきた。', cg: 'cg_hinata_run' },
                { speaker: '???', text: 'ご、ごめん！ ボール追いかけてたら止まれなくて！！', charId: 'hinata', expression: 'surprised', position: 'center' },
                { speaker: '主人公', text: 'いてて……大丈夫、怪我はないよ。' },
                { speaker: '', text: 'メガネ越しに見ると「好感度　5」。まだ他人同士だ。' },
                { speaker: '???', text: 'ほんと！？ よかったー！ あたし日向陽葵！ よろしくね！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '陽葵', text: 'お詫びにジュースおごるよ！ 何がいい？', charId: 'hinata', expression: 'happy', position: 'center' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: 'スポーツドリンクがいいな', effects: { hinata: 3 }, next: 'hinata_c1a' },
                        { text: 'じゃあコーヒーで',         effects: { hinata: 1 }, next: 'hinata_c1b' },
                        { text: '気にしなくていいよ',       effects: { hinata: 2 }, next: 'hinata_c1c' },
                    ]
                },
                { id: 'hinata_c1a', speaker: '陽葵', text: 'おっ、わかってるね！ スポーツマン？', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'hinata_c1b', speaker: '陽葵', text: 'コーヒー？ 大人だね〜！', charId: 'hinata', expression: 'happy', position: 'center' },
                { id: 'hinata_c1c', speaker: '陽葵', text: 'えー、そう言われると逆に申し訳ないよ〜！', charId: 'hinata', expression: 'happy', position: 'center' },
                { speaker: '主人公', text: '（好感度の数字……これを上げていけば、もっと仲良くなれる）' },
                { speaker: '', text: 'こうして三人との出会いが揃った。メガネを手に、高校生活が本格的に始まる。' },
            ],
            onComplete() {
                GameEngine.setFlag('meet_hinata_done');
                GameEngine.modifyAffection('hinata', 3);
            }
        }],

        // ── 1年生 5月 第2週：中間テスト ──
        'y1_m5_w2': [{
            id: 'midterm_1_1',
            title: '初めての中間テスト',
            bg: 'bg-classroom',
            messages: [
                { speaker: '', text: '中間テストが近づいてきた。メガネで数字を確認しながら、誰と勉強しようか考えた。' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '栞に勉強を教えてもらう', effects: { fumino: 5, study: 3 }, next: 'mid_fumino' },
                        { text: '一人で頑張る',           effects: { study: 2 },           next: 'mid_solo' },
                        { text: '陽葵と一緒に勉強する',   effects: { hinata: 3 },           next: 'mid_hinata' },
                    ]
                },
                { id: 'mid_fumino', speaker: '栞', text: 'いいよ、一緒に勉強しよう。ここ、こうすると分かりやすいよ。', charId: 'fumino', expression: 'happy', position: 'center', cg: 'cg_fumino_library' },
                { id: 'mid_fumino', speaker: '', text: '栞の教え方はとても丁寧だった。メガネ越しの数字が、少し上がった。' },
                { id: 'mid_solo', speaker: '', text: '一人で黙々と勉強した。地道だが力はついた。' },
                { id: 'mid_hinata', speaker: '陽葵', text: 'うーん、全然わかんない！ でも一緒だと頑張れる気がする！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '', text: 'テストを終えて、メガネを外してみた。' },
                { speaker: '主人公', text: '（……外すと、数字が消える。当たり前だけど）' },
                { speaker: '', text: 'なぜか、少し不安になった。数字がないと、何を信じていいかわからない気がして。' },
            ],
            onComplete() {
                GameEngine.setFlag('midterm_1_done');
            }
        }],

        // ── 1年生 7月 第3週：夏休み前 ──
        'y1_m7_w3': [{
            id: 'summer_1',
            title: '夏休み前の放課後',
            bg: 'bg-hallway',
            messages: [
                { speaker: '', text: 'もうすぐ夏休み。入学からしばらく経ち、メガネの使い方も慣れてきた。' },
                { speaker: '主人公', text: '（数字を見ながら行動するのが、もう習慣になってきてるな……）' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんの様子が気になる', effects: { sakuragi: 2 }, next: 'sum1_sakuragi' },
                        { text: '栞と図書室に行く',         effects: { fumino: 3 },   next: 'sum1_fumino' },
                        { text: '陽葵の部活を見に行く',     effects: { hinata: 3 },   next: 'sum1_hinata' },
                    ]
                },
                { id: 'sum1_sakuragi', speaker: '彩華', text: '……また会ったわね。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { id: 'sum1_sakuragi', speaker: '主人公', text: '良い夏休みを、桜木さん。' },
                { id: 'sum1_sakuragi', speaker: '彩華', text: '……ありがとう。あなたもね。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'sum1_sakuragi', speaker: '主人公', text: '（メガネ越しに見た数字、少し上がってた気がした）' },
                { id: 'sum1_fumino', speaker: '栞', text: '夏休みにおすすめの本、リストを作ったの。見る？', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'sum1_fumino', speaker: '主人公', text: '栞の選ぶ本はいつも面白いからな。楽しみだよ。' },
                { id: 'sum1_fumino', speaker: '栞', text: 'えへへ……嬉しい。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'sum1_hinata', speaker: '陽葵', text: '見に来てくれたの？ よっしゃ、いいとこ見せるよ！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'sum1_hinata', speaker: '', text: '陽葵のプレーは見ているだけで元気になれる。' },
                { speaker: '', text: '1学期が終わり、夏休みが始まった。' },
            ],
            onComplete() {
                GameEngine.setFlag('summer_1_done');
            }
        }],

        // ── 1年生 9月 第3週：文化祭 ──
        'y1_m9_w3': [{
            id: 'festival_1',
            title: '初めての文化祭',
            bg: 'bg-festival',
            messages: [
                { speaker: '', text: '桜花学園の文化祭「桜花祭」。校内は活気に満ち溢れている。' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんを探す',         effects: { sakuragi: 5 }, next: 'fest1_sakuragi', flag: 'fest1_sakuragi' },
                        { text: '栞と文芸部の展示を見る', effects: { fumino: 5 },   next: 'fest1_fumino',   flag: 'fest1_fumino' },
                        { text: '陽葵の模擬店を手伝う',   effects: { hinata: 5 },   next: 'fest1_hinata',   flag: 'fest1_hinata' },
                    ]
                },
                { id: 'fest1_sakuragi', speaker: '', text: '屋上で一人佇む彩華さんを見つけた。', cg: 'cg_sakuragi_festival' },
                { id: 'fest1_sakuragi', speaker: '彩華', text: '騒がしいのは少し苦手なの。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { id: 'fest1_sakuragi', speaker: '主人公', text: '一人は寂しくない？' },
                { id: 'fest1_sakuragi', speaker: '彩華', text: '……今は、あなたがいるから。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'fest1_fumino', speaker: '栞', text: '私の書いた短編、読んでくれる……？', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'fest1_fumino', speaker: '主人公', text: 'もちろん。栞の文章、好きだよ。' },
                { id: 'fest1_fumino', speaker: '栞', text: '……っ！ ありがとう……！', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'fest1_hinata', speaker: '陽葵', text: 'やった！ 助っ人大歓迎！ はい、エプロン！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'fest1_hinata', speaker: '', text: '陽葵と一緒に焼きそばを焼いた。楽しい時間だった。' },
                { speaker: '', text: '文化祭は大成功に終わった。' },
            ],
            onComplete() {
                GameEngine.setFlag('festival_1_done');
            }
        }],

        // ── 1年生 12月 第3週：クリスマス ──
        'y1_m12_w3': [{
            id: 'christmas_1',
            title: '最初のクリスマス',
            bg: 'bg-night',
            messages: [
                { speaker: '', text: '12月。街はクリスマスのイルミネーションで彩られている。' },
                { speaker: '主人公', text: '（メガネで数字を確認しながら……今夜、誰と過ごそうか）' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんにマフラーを贈る', effects: { sakuragi: 5 }, next: 'xmas1_sakuragi' },
                        { text: '栞と温かい飲み物を飲む',   effects: { fumino: 5 },   next: 'xmas1_fumino' },
                        { text: '陽葵とイルミネーションを見る', effects: { hinata: 5 }, next: 'xmas1_hinata' },
                    ]
                },
                { id: 'xmas1_sakuragi', speaker: '彩華', text: '……私に？ どうして。', charId: 'sakuragi', expression: 'surprised', position: 'center' },
                { id: 'xmas1_sakuragi', speaker: '主人公', text: '似合うと思って。メリークリスマス。' },
                { id: 'xmas1_sakuragi', speaker: '彩華', text: '……ありがとう。大切にするわ。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'xmas1_fumino', speaker: '栞', text: 'はい、ココア。あったまるよ。', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'xmas1_fumino', speaker: '主人公', text: 'ありがとう。栞と飲むと特別美味しい気がする。' },
                { id: 'xmas1_fumino', speaker: '栞', text: 'もう……恥ずかしいこと言わないで。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'xmas1_hinata', speaker: '陽葵', text: 'わー！ きれー！！ 見て見て！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'xmas1_hinata', speaker: '', text: '陽葵の目にイルミネーションが映って、宝石みたいに輝いていた。' },
                { speaker: '', text: 'こうして1年生の年が暮れていく。' },
            ],
            onComplete() {
                GameEngine.setFlag('christmas_1_done');
            }
        }],

        // ── 2年生 4月 第1週 ──
        'y2_m4_w1': [{
            id: 'year2_start',
            title: '2年生の春',
            bg: 'bg-sakura',
            messages: [
                { speaker: '', text: '2年生になった。メガネを手に入れてから一年。すっかり数字を見ることが習慣になっている。' },
                { speaker: '主人公', text: '（彩華さんの数字は……だいぶ上がってきた。栞も、陽葵も）' },
                { speaker: '', text: 'ふと思った——この一年、自分は本当に相手のことを見ていたのだろうか？' },
                { speaker: '', text: 'それとも、ただ数字を追いかけていただけ？' },
                { speaker: '主人公', text: '（……いや、関係ない。俺は彼女たちのことを好きになってる。それは本物だ）' },
                { speaker: '', text: '自分に言い聞かせながら、2年目の物語が始まった。' },
            ],
            onComplete() {
                GameEngine.setFlag('year2_start_done');
            }
        }],

        // ── 2年生 6月 第2週：梅雨 ──
        'y2_m6_w2': [{
            id: 'rainy_season',
            title: '雨の日の出来事',
            bg: 'bg-classroom',
            messages: [
                { speaker: '', text: '梅雨。窓の外は灰色の雨。傘を忘れた。' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんが昇降口にいる', effects: { sakuragi: 5 }, next: 'rain_sakuragi' },
                        { text: '栞が傘を持って来てくれた', effects: { fumino: 5 }, next: 'rain_fumino', cg: 'cg_fumino_rain' },
                        { text: '陽葵と雨の中を走る',     effects: { hinata: 5 },   next: 'rain_hinata' },
                    ]
                },
                { id: 'rain_sakuragi', speaker: '彩華', text: '傘、ないの？ ……仕方ないわね。入りなさい。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { id: 'rain_sakuragi', speaker: '', text: '桜木さんの傘の下、肩が触れそうな距離で歩いた。' },
                { id: 'rain_sakuragi', speaker: '彩華', text: '……そんなに離れなくていいのに。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'rain_fumino', speaker: '栞', text: '天気予報見て……持ってきたの。一緒に帰ろう？', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'rain_fumino', speaker: '主人公', text: 'ありがとな、栞。昔からそういうとこ、変わらないな。' },
                { id: 'rain_fumino', speaker: '栞', text: '幼馴染だから……それだけだよ。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'rain_hinata', speaker: '陽葵', text: '傘ない？ じゃあ走ろう！ せーのっ！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'rain_hinata', speaker: '', text: '雨の中を二人で走った。ずぶ濡れだけど、笑いが止まらなかった。' },
                { speaker: '', text: '雨の日の小さな思い出。忘れられない一日になった。' },
            ],
            onComplete() {
                GameEngine.setFlag('rainy_done');
            }
        }],

        // ── 2年生 8月 第2週：夏の海 ──
        'y2_m8_w2': [{
            id: 'summer_2',
            title: '夏の思い出',
            bg: 'bg-schoolyard',
            messages: [
                { speaker: '', text: '夏休み。クラスの仲間と海に来ている。' },
                { speaker: '主人公', text: '（水場だし、メガネは外しておくか）' },
                { speaker: '', text: 'メガネを外した瞬間——' },
                { speaker: '', text: '…………なんか、違う？', },
                { speaker: '主人公', text: '（いや……気のせいか。日差しのせいだろう）' },
                { speaker: '', text: 'すぐにメガネをかけ直した。数字が戻ってくる。いつもの景色だ。' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんと浜辺を散歩', effects: { sakuragi: 5, charm: 2 },  next: 'beach_sakuragi' },
                        { text: '栞と貝殻を集める',     effects: { fumino: 5, culture: 2 }, next: 'beach_fumino' },
                        { text: '陽葵とビーチバレー',   effects: { hinata: 5, sports: 2 },  next: 'beach_hinata', cg: 'cg_hinata_beach' },
                    ]
                },
                { id: 'beach_sakuragi', speaker: '彩華', text: '海は久しぶりだわ。……少し、歩かない？', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'beach_sakuragi', speaker: '彩華', text: 'あなたといると……少し、不思議な気持ちになるの。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'beach_fumino', speaker: '栞', text: 'この貝殻、きれいだね。本のしおりにしようかな。', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'beach_fumino', speaker: '栞', text: '今日のこと、ずっと覚えていたいな。', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'beach_hinata', speaker: '陽葵', text: 'よーし！ ペア組もう！ 負けないよ！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'beach_hinata', speaker: '陽葵', text: 'やったー！ 最高のチームだね！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '', text: '忘れられない夏の思い出が、また一つ増えた。' },
            ],
            onComplete() {
                GameEngine.setFlag('summer_2_done');
            }
        }],

        // ── 2年生 10月 第2週：体育祭 ──
        'y2_m10_w2': [{
            id: 'sports_festival',
            title: '燃える体育祭',
            bg: 'bg-schoolyard',
            messages: [
                { speaker: '', text: '秋の体育祭。学園全体が熱気に包まれている。' },
                { speaker: '陽葵', text: 'よーし、今年は絶対優勝するぞー！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '栞', text: '私は……応援、頑張るね。', charId: 'fumino', expression: 'happy', position: 'center' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: 'リレーのアンカーを務める', effects: { sports: 3, hinata: 3 },  next: 'sports_relay' },
                        { text: '応援で盛り上げる',         effects: { charm: 3, sakuragi: 3 }, next: 'sports_cheer' },
                        { text: '競技の記録係を手伝う',     effects: { study: 2, fumino: 3 },   next: 'sports_record' },
                    ]
                },
                { id: 'sports_relay', speaker: '陽葵', text: 'すっごーい！ かっこよかったよ！！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { id: 'sports_cheer', speaker: '彩華', text: '……声が枯れてるわよ。はい、のど飴。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { id: 'sports_record', speaker: '栞', text: '一緒にやってくれてありがとう。心強かった。', charId: 'fumino', expression: 'happy', position: 'center' },
                { speaker: '', text: '体育祭は大いに盛り上がった。' },
            ],
            onComplete() {
                GameEngine.setFlag('sports_festival_done');
            }
        }],

        // ── 2年生 12月 第3週：クリスマス ──
        'y2_m12_w3': [{
            id: 'christmas_2',
            title: '特別なクリスマス',
            bg: 'bg-night',
            messages: [
                { speaker: '', text: '2年目のクリスマス。メガネの数字は着実に上がってきた。' },
                { speaker: '主人公', text: '（……あと少しで、告白できるくらいの数字になる）' },
                { speaker: '', text: 'ふと気になった——この気持ちは、本当に「好き」なのか。それとも、数字を上げたいだけなのか。' },
                { speaker: '主人公', text: '（……俺は、ちゃんと彼女のことを見てる。顔だけじゃない、中身を）' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんをコンサートに誘う', effects: { sakuragi: 8, culture: 2 }, next: 'xmas2_sakuragi' },
                        { text: '栞と本屋に行く',             effects: { fumino: 8, study: 2 },   next: 'xmas2_fumino' },
                        { text: '陽葵とスケートに行く',       effects: { hinata: 8, sports: 2 },  next: 'xmas2_hinata' },
                    ]
                },
                { id: 'xmas2_sakuragi', speaker: '彩華', text: '……誘ってくれるの？ 嬉しい、わ。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'xmas2_sakuragi', speaker: '彩華', text: '今日は……楽しかった。また、こうして……。', charId: 'sakuragi', expression: 'happy', position: 'center' },
                { id: 'xmas2_fumino', speaker: '栞', text: '二人で本屋さん……なんだかデートみたいだね。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'xmas2_fumino', speaker: '栞', text: '……っ！ もう、からかわないで……。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'xmas2_hinata', speaker: '陽葵', text: 'わわっ、滑る滑る！ 手、つかまっていい？', charId: 'hinata', expression: 'surprised', position: 'center' },
                { id: 'xmas2_hinata', speaker: '陽葵', text: '今日めっちゃ楽しい！ ……ありがとね。', charId: 'hinata', expression: 'happy', position: 'center' },
                { speaker: '', text: '気持ちが、少しずつ形になっていく。' },
            ],
            onComplete() {
                GameEngine.setFlag('christmas_2_done');
            }
        }],

        // ── 3年生 4月 第1週 ──
        'y3_m4_w1': [{
            id: 'year3_start',
            title: '最後の春',
            bg: 'bg-sakura',
            messages: [
                { speaker: '', text: '3年生———最後の一年。' },
                { speaker: '', text: 'メガネを手に入れてから2年。当たり前のようにかけている。' },
                { speaker: '主人公', text: '（……このメガネがなくても、俺は彼女たちのことが好きなのか？）' },
                { speaker: '', text: 'そんな問いが頭をよぎったが、考えるのをやめた。' },
                { speaker: '主人公', text: '（今年中に、想いを伝える。それだけだ）' },
                { speaker: '', text: '桜の花びらが、静かに背中を押してくれている気がした。' },
            ],
            onComplete() {
                GameEngine.setFlag('year3_start_done');
            }
        }],

        // ── 3年生 7月 第2週：夏の決意 ──
        'y3_m7_w2': [{
            id: 'summer_resolve',
            title: '夏の決意',
            bg: 'bg-rooftop',
            messages: [
                { speaker: '', text: '屋上で一人、夕日を眺めている。メガネを外して、空を見た。' },
                { speaker: '', text: '——数字のない世界は、思ったよりも静かだ。' },
                { speaker: '主人公', text: '（このメガネがあったから、俺は自分を磨けた。間違いなく）' },
                { speaker: '主人公', text: '（でも……卒業式には、外して告白しようと思う）' },
                { speaker: '', text: '数字に頼らず、自分の気持ちだけで——それが、本物の告白だと思うから。' },
                { speaker: '主人公', text: '（この夏を、悔いなく生きよう）' },
            ],
            onComplete() {
                GameEngine.setFlag('summer_resolve_done');
            }
        }],

        // ── 3年生 9月 第3週：最後の文化祭 ──
        'y3_m9_w3': [{
            id: 'festival_3',
            title: '最後の桜花祭',
            bg: 'bg-festival',
            messages: [
                { speaker: '', text: '最後の文化祭。後夜祭のキャンプファイヤーが始まった。' },
                { speaker: '主人公', text: '（……卒業まで、あと半年。告白の練習、しておこうか）' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '彩華さんを後夜祭に誘う',   effects: { sakuragi: 10 }, next: 'fest3_sakuragi' },
                        { text: '栞と二人で静かに過ごす',   effects: { fumino: 10 },   next: 'fest3_fumino' },
                        { text: '陽葵と踊る',               effects: { hinata: 10 },   next: 'fest3_hinata' },
                    ]
                },
                { id: 'fest3_sakuragi', speaker: '彩華', text: '……来てくれたの。ずっと、待ってた。', charId: 'sakuragi', expression: 'happy', position: 'center' },
                { id: 'fest3_sakuragi', speaker: '彩華', text: 'ねえ……卒業しても、こうして一緒にいられるかしら。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { id: 'fest3_fumino', speaker: '栞', text: '図書室の窓から、二人でキャンプファイヤーを眺めた。', charId: 'fumino', expression: 'happy', position: 'center', cg: 'cg_fumino_starry' },
                { id: 'fest3_fumino', speaker: '栞', text: '……あなたと見たこと、忘れたくないな。', charId: 'fumino', expression: 'shy', position: 'center' },
                { id: 'fest3_hinata', speaker: '陽葵', text: 'えっ、踊るの！？ あたし踊りとか全然ダメなんだけど！', charId: 'hinata', expression: 'surprised', position: 'center' },
                { id: 'fest3_hinata', speaker: '主人公', text: '大丈夫、僕もだから。一緒に下手くそでいよう。' },
                { id: 'fest3_hinata', speaker: '陽葵', text: 'あはは！ ……でも、うん、いいね。', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '', text: '最後の文化祭の夜は、こうして更けていった。' },
            ],
            onComplete() {
                GameEngine.setFlag('festival_3_done');
            }
        }],

        // ── 3年生 2月 第2週：卒業前夜 ──
        'y3_m2_w2': [{
            id: 'pre_graduation',
            title: '卒業を前にして',
            bg: 'bg-classroom',
            messages: [
                { speaker: '', text: '卒業式まで、あとわずか。' },
                { speaker: '', text: 'メガネを手の中で転がした。二年半、ずっと一緒だった。' },
                { speaker: '主人公', text: '（このメガネがあったから……俺は自分を磨けた。彼女たちとここまで来れた）' },
                { speaker: '主人公', text: '（でも、告白するときは、これを外す）' },
                { speaker: '', text: '数字に頼らない、本物の気持ちだけで向き合う。それが、この2年半の答えだ。' },
                { speaker: '主人公', text: '（……怖い。数字がないと、何が見えるか分からない）' },
                { speaker: '主人公', text: '（それでも、外す。それが俺の誠実さだから）' },
            ],
            onComplete() {
                GameEngine.setFlag('pre_graduation_done');
            }
        }],

        // ── 卒業式（エンディングトリガー） ──
        'y3_m3_w2': [{
            id: 'graduation',
            title: '卒業式',
            bg: 'bg-graduation',
            isEnding: true,
            messages: [
                { speaker: '', text: '卒業式の日が来た。' },
                { speaker: '', text: '桜の花びらが舞う中、式が終わった。みんなが写真を撮り、涙を流している。' },
                { speaker: '', text: '胸ポケットのメガネを取り出した。' },
                { speaker: '主人公', text: '（……あの人を探そう。そして、これを外して、伝える）' },
            ],
            onComplete() {
                GameEngine.setFlag('graduation_done');
            }
        }],
    },

    // ============================================================
    //  好感度トリガーイベント
    // ============================================================
    affectionEvents: [
        {
            heroine: 'sakuragi', threshold: 30, year: 2, flag: 'sakuragi_rooftop',
            id: 'sakuragi_rooftop_event', title: '屋上の秘密',
            bg: 'bg-rooftop',
            messages: [
                { speaker: '', text: '放課後、屋上に呼び出された。', cg: 'cg_sakuragi_rooftop' },
                { speaker: '彩華', text: 'ここでなら、誰にも聞かれないから。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { speaker: '彩華', text: '……私ね、本当は人付き合いが苦手なの。みんなが思っているような完璧な人間じゃない。', charId: 'sakuragi', expression: 'sad', position: 'center' },
                { speaker: '彩華', text: 'でも、あなたの前では……素でいられる気がするの。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '僕の前では無理しなくていいよ', effects: { sakuragi: 8 },  next: 'sak_roof_a' },
                        { text: '完璧じゃなくても素敵だよ',     effects: { sakuragi: 10 }, next: 'sak_roof_b' },
                    ]
                },
                { id: 'sak_roof_a', speaker: '彩華', text: '……ありがとう。そう言ってもらえると、救われるわ。', charId: 'sakuragi', expression: 'happy', position: 'center' },
                { id: 'sak_roof_b', speaker: '彩華', text: '……っ！ そんなこと、言われたの初めて……。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                { speaker: '主人公', text: '（……俺、彩華さんの内面が好きなんだな。ちゃんと。数字じゃなくて）' },
            ],
            onComplete() { GameEngine.setFlag('sakuragi_rooftop'); }
        },
        {
            heroine: 'fumino', threshold: 30, year: 2, flag: 'fumino_secret',
            id: 'fumino_secret_event', title: '栞の秘密',
            bg: 'bg-library',
            messages: [
                { speaker: '', text: '図書室で、栞がノートに何かを書いている。' },
                { speaker: '主人公', text: '栞、何書いてるの？' },
                { speaker: '栞', text: 'だっ、だめ！ 見ちゃダメ！', charId: 'fumino', expression: 'surprised', position: 'center' },
                { speaker: '栞', text: '……これはね、小説なの。いつか、本にしたいなって……。', charId: 'fumino', expression: 'shy', position: 'center' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '読ませてほしいな', effects: { fumino: 8 },  next: 'fum_sec_a' },
                        { text: '応援してるよ',     effects: { fumino: 10 }, next: 'fum_sec_b' },
                    ]
                },
                { id: 'fum_sec_a', speaker: '栞', text: '……完成したら、一番最初に読んでもらうね。約束。', charId: 'fumino', expression: 'happy', position: 'center' },
                { id: 'fum_sec_b', speaker: '栞', text: '……うん。あなたがそう言ってくれるなら、頑張れる気がする。', charId: 'fumino', expression: 'happy', position: 'center' },
                { speaker: '主人公', text: '（栞の心の中にあるものを、俺はちゃんと見てきた。そう思う）' },
            ],
            onComplete() { GameEngine.setFlag('fumino_secret'); }
        },
        {
            heroine: 'hinata', threshold: 30, year: 2, flag: 'hinata_injury',
            id: 'hinata_injury_event', title: '日向の怪我',
            bg: 'bg-gym',
            messages: [
                { speaker: '', text: '日向が練習中に足を捻ったらしい。保健室に駆けつけた。' },
                { speaker: '陽葵', text: '大丈夫だよ、ちょっと捻っただけ！', charId: 'hinata', expression: 'happy', position: 'center' },
                { speaker: '', text: 'そう言うけれど、目が少し潤んでいる。' },
                { speaker: '陽葵', text: '……ごめん、ちょっとだけ、痛い。', charId: 'hinata', expression: 'sad', position: 'center' },
                {
                    speaker: '', text: '',
                    choices: [
                        { text: '無理するなよ',   effects: { hinata: 8 },  next: 'hin_inj_a' },
                        { text: 'そばにいるから', effects: { hinata: 10 }, next: 'hin_inj_b' },
                    ]
                },
                { id: 'hin_inj_a', speaker: '陽葵', text: 'うん……ありがと。心配してくれて嬉しい。', charId: 'hinata', expression: 'happy', position: 'center' },
                { id: 'hin_inj_b', speaker: '陽葵', text: '……っ、なんか泣きそう。嬉しくて。', charId: 'hinata', expression: 'shy', position: 'center' },
                { speaker: '主人公', text: '（強がりな陽葵の弱い部分を見た。守りたいと思った。これが本物だ）' },
            ],
            onComplete() { GameEngine.setFlag('hinata_injury'); }
        },
    ],

    // ============================================================
    //  季節イベント
    // ============================================================
    seasonalEvents: {
        'y1_summer': [{
            id: 'summer_pool', title: '夏のプール授業', bg: 'bg-schoolyard',
            messages: [
                { speaker: '', text: '夏のプール授業。メガネは外さなければならない。' },
                { speaker: '主人公', text: '（数字が見えない……なんか落ち着かないな）' },
                { speaker: '陽葵', text: 'プール最高！ 泳ごう泳ごう！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '栞', text: '私は日陰で見てるね……。', charId: 'fumino', expression: 'normal', position: 'center' },
                { speaker: '主人公', text: '（……でも、数字がなくてもみんな楽しそうだ。それは変わらない）' },
            ],
            onComplete() { GameEngine.setFlag('y1_summer_done'); }
        }],
        'y2_autumn': [{
            id: 'autumn_walk', title: '秋の遠足', bg: 'bg-park',
            messages: [
                { speaker: '', text: '紅葉の遠足。班行動で三人と一緒のグループになった。' },
                { speaker: '彩華', text: '紅葉って、散るからこそ美しいのかもしれないわね。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                { speaker: '栞', text: 'まるで詩みたい……素敵。', charId: 'fumino', expression: 'happy', position: 'center' },
                { speaker: '陽葵', text: '落ち葉バトルしようぜー！', charId: 'hinata', expression: 'laugh', position: 'center' },
                { speaker: '主人公', text: '（三人三様。好きだなあ、それぞれが）' },
            ],
            onComplete() { GameEngine.setFlag('y2_autumn_done'); }
        }],
        'y3_winter': [{
            id: 'winter_study', title: '受験の冬', bg: 'bg-classroom',
            messages: [
                { speaker: '', text: '受験シーズン。教室の空気がピリッと張り詰めている。' },
                { speaker: '栞', text: '……頑張ろうね。一緒に。', charId: 'fumino', expression: 'happy', position: 'center' },
                { speaker: '陽葵', text: 'スポーツ推薦の面接、緊張するー！', charId: 'hinata', expression: 'surprised', position: 'center' },
                { speaker: '彩華', text: '……あなたなら大丈夫よ。信じてるわ。', charId: 'sakuragi', expression: 'happy', position: 'center' },
                { speaker: '主人公', text: '（卒業の日は、もうすぐそこだ……）' },
            ],
            onComplete() { GameEngine.setFlag('y3_winter_done'); }
        }],
    },

    // ============================================================
    //  エンディング — メガネを外す「真実の告白」
    // ============================================================
    endings: {
        sakuragi: {
            true: {
                title: 'TRUE END：素顔の花',
                cgBefore: 'cg_sakuragi_ending',
                cgAfter: 'cg_sakuragi_true_end',
                heroineName: '桜木 彩華',
                messages: [
                    { speaker: '', text: '桜の木の下———あの日と同じ場所で、彩華さんを見つけた。' },
                    { speaker: '彩華', text: '……呼び出すなんて珍しいわね。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                    { speaker: '主人公', text: '彩華さんに……伝えたいことがある。' },
                    { speaker: '', text: '胸ポケットから、メガネを取り出した。' },
                    { speaker: '主人公', text: 'ずっと……このメガネをかけてた。これをかけると、君の好感度が数字で見えるんだ。' },
                    { speaker: '彩華', text: '……え？', charId: 'sakuragi', expression: 'surprised', position: 'center' },
                    { speaker: '主人公', text: 'これを使って自分を磨いて、近づいてきた。だから……ちゃんと話さないとダメだと思って。' },
                    { speaker: '', text: '彩華さんの表情が、固まった。' },
                    { speaker: '主人公', text: '外して、告白する。これが、俺の正直な気持ちだから——' },
                    // ── メガネを外す演出 ──
                    { speaker: '', text: 'メガネを外した。', glassesOff: true },
                    { speaker: '', text: '視界が、少し変わった。' },
                    { speaker: '', text: '——桜木彩華。メガネ越しに見ていた彼女とは、少し違う。', charId: 'sakuragi', expression: 'true', position: 'center', cg: 'cg_sakuragi_true_end' },
                    { speaker: '', text: 'でも———彼女の目は、あの日から何一つ変わっていなかった。迷いのない、澄んだ瞳。' },
                    { speaker: '主人公', text: '……好きだ。入学式の日から、ずっと。' },
                    { speaker: '彩華', text: '……っ。', charId: 'sakuragi', expression: 'shy', position: 'center' },
                    { speaker: '彩華', text: 'ばか……そんな告白の仕方、ある？ 泣くじゃない……。', charId: 'sakuragi', expression: 'sad', position: 'center' },
                    { speaker: '彩華', text: '……でも。ありがとう、正直に言ってくれて。私も好きよ。ずっと、ずっと。', charId: 'sakuragi', expression: 'happy', position: 'center' },
                    { speaker: '', text: '桜の花びらが舞い散る中、二人の手が重なった。' },
                    { speaker: '', text: 'メガネが見せていたのは、数字じゃなかったのかもしれない。彼女の心の、本当の美しさだったのだから。' },
                ],
            },
            good: {
                title: 'GOOD END：近づく距離',
                messages: [
                    { speaker: '', text: '卒業式の後、彩華さんを見つけた。' },
                    { speaker: '主人公', text: 'メガネを取り出した。「ずっとこれをかけてた。好感度が見えるんだ」' },
                    { speaker: '彩華', text: '……そう、なの。', charId: 'sakuragi', expression: 'surprised', position: 'center' },
                    { speaker: '', text: 'メガネを外した。視界が変わった。でも彼女の目は、変わらない。', glassesOff: true, charId: 'sakuragi', expression: 'true', position: 'center' },
                    { speaker: '主人公', text: '……好きだ。返事は、まだいい。でもいつか、聞かせてほしい。' },
                    { speaker: '彩華', text: '……連絡、くれる？', charId: 'sakuragi', expression: 'shy', position: 'center' },
                    { speaker: '', text: 'それだけで、十分だった。' },
                ],
            },
            normal: {
                title: 'NORMAL END：それぞれの道',
                messages: [
                    { speaker: '', text: '卒業式が終わった。彩華さんは多くの人に囲まれている。' },
                    { speaker: '', text: 'メガネをポケットにしまい、遠くから「おめでとう」とだけ伝えた。' },
                    { speaker: '彩華', text: '……ありがとう。元気でね。', charId: 'sakuragi', expression: 'normal', position: 'center' },
                    { speaker: '', text: 'いつかまた、今度は数字なしで向き合える日が来るかもしれない。' },
                ],
            },
        },
        fumino: {
            true: {
                title: 'TRUE END：物語の続き',
                cgBefore: 'cg_fumino_ending',
                cgAfter: 'cg_fumino_true_end',
                heroineName: '文野 栞',
                messages: [
                    { speaker: '', text: '卒業式の後、図書室に向かった。きっと、栞はそこにいる。' },
                    { speaker: '栞', text: 'やっぱり、来てくれた。', charId: 'fumino', expression: 'happy', position: 'center' },
                    { speaker: '主人公', text: '栞に……話がある。' },
                    { speaker: '', text: 'メガネを机の上に置いた。' },
                    { speaker: '主人公', text: 'ずっとこれをかけてた。これで……君の好感度が見えてたんだ。' },
                    { speaker: '栞', text: '……え。', charId: 'fumino', expression: 'surprised', position: 'center' },
                    { speaker: '主人公', text: '卑怯だったかもしれない。でも、君のことが好きなのは本当だ。だから正直に言う。' },
                    { speaker: '', text: 'メガネを外した。', glassesOff: true },
                    { speaker: '', text: '視界が変わった。栞の姿が、少し違って見える。', charId: 'fumino', expression: 'true', position: 'center', cg: 'cg_fumino_true_end' },
                    { speaker: '', text: '——でも、その目は同じだった。膨大な本を読み続けてきた、深くて温かい瞳。' },
                    { speaker: '主人公', text: '好きだ。君の心が、一番きれいだって思ってた。ずっと。' },
                    { speaker: '栞', text: '……っ！', charId: 'fumino', expression: 'surprised', position: 'center' },
                    { speaker: '栞', text: '……私もね、書いたの。あなたへの気持ちを。「好き」って言葉じゃ足りないくらいだから、小説にしたの。', charId: 'fumino', expression: 'shy', position: 'center' },
                    { speaker: '', text: '互いの「物語」を交換した。二人だけの、大切な物語の続きが始まる。' },
                ],
            },
            good: {
                title: 'GOOD END：変わらない場所',
                messages: [
                    { speaker: '', text: '図書室で、メガネのことを打ち明けた。' },
                    { speaker: '主人公', text: '「好感度が見える眼鏡だったんだ。ごめん」' },
                    { speaker: '', text: 'メガネを外した。視界が変わった。でも栞の笑顔は、変わらない。', glassesOff: true, charId: 'fumino', expression: 'true', position: 'center' },
                    { speaker: '栞', text: '……メガネをかけてても外しても、あなたはあなただよ。', charId: 'fumino', expression: 'happy', position: 'center' },
                    { speaker: '栞', text: '卒業しても、ここに来ていい？', charId: 'fumino', expression: 'sad', position: 'center' },
                    { speaker: '主人公', text: '僕もここに来るよ。栞に会うために。' },
                ],
            },
            normal: {
                title: 'NORMAL END：それぞれの道',
                messages: [
                    { speaker: '', text: '卒業式の帰り道、栞とすれ違った。' },
                    { speaker: '栞', text: '卒業おめでとう。……元気でね。', charId: 'fumino', expression: 'happy', position: 'center' },
                    { speaker: '', text: '昔と変わらない穏やかな笑顔。この笑顔を、ずっと覚えていよう。' },
                ],
            },
        },
        hinata: {
            true: {
                title: 'TRUE END：太陽と共に',
                cgBefore: 'cg_hinata_ending',
                cgAfter: 'cg_hinata_true_end',
                heroineName: '日向 陽葵',
                messages: [
                    { speaker: '', text: '卒業式の後、グラウンドで陽葵を待った。' },
                    { speaker: '陽葵', text: 'ここにいると思った！', charId: 'hinata', expression: 'laugh', position: 'center' },
                    { speaker: '主人公', text: '陽葵、言いたいことがある。' },
                    { speaker: '', text: 'メガネを取り出した。' },
                    { speaker: '主人公', text: 'ずっと……このメガネをかけてた。これで君の好感度が見えてたんだ。' },
                    { speaker: '陽葵', text: '……え、マジで？', charId: 'hinata', expression: 'surprised', position: 'center' },
                    { speaker: '主人公', text: 'これを外して言う。それが俺の誠実さだから——' },
                    { speaker: '', text: 'メガネを外した。', glassesOff: true },
                    { speaker: '', text: '視界が変わった。陽葵の姿が、少し違って見える。', charId: 'hinata', expression: 'true', position: 'center', cg: 'cg_hinata_true_end' },
                    { speaker: '', text: '——でも、あの笑顔だけは変わらない。太陽みたいに、まっすぐな笑顔。' },
                    { speaker: '主人公', text: '好きだ。お前の笑顔も、元気なところも、泣き虫なところも、全部。' },
                    { speaker: '陽葵', text: '……え、えぇっ！？', charId: 'hinata', expression: 'surprised', position: 'center' },
                    { speaker: '陽葵', text: '………………あたしも。大好き！！', charId: 'hinata', expression: 'laugh', position: 'center' },
                    { speaker: '', text: '涙と笑顔が混ざった、最高の表情だった。' },
                    { speaker: '', text: 'これからも、この太陽と一緒に歩いていく。' },
                ],
            },
            good: {
                title: 'GOOD END：一緒にいよう',
                messages: [
                    { speaker: '', text: 'グラウンドでメガネの秘密を話した。' },
                    { speaker: '主人公', text: '「好感度が数字で見えるメガネだったんだ。外して言う——好きだ」' },
                    { speaker: '', text: 'メガネを外した。視界が変わった。でも陽葵の笑顔は、変わらない。', glassesOff: true, charId: 'hinata', expression: 'true', position: 'center' },
                    { speaker: '陽葵', text: 'あははっ！ そんな告白ある！？', charId: 'hinata', expression: 'laugh', position: 'center' },
                    { speaker: '陽葵', text: '……でも、ありがとね。正直に話してくれて。これからも一緒にいてくれる？', charId: 'hinata', expression: 'happy', position: 'center' },
                ],
            },
            normal: {
                title: 'NORMAL END：それぞれの道',
                messages: [
                    { speaker: '', text: '陽葵が卒業式で泣いていた。' },
                    { speaker: '陽葵', text: '楽しかったよなー、三年間！ ……ありがとね！', charId: 'hinata', expression: 'laugh', position: 'center' },
                    { speaker: '', text: '眩しい笑顔と涙。陽葵らしい最後だった。' },
                ],
            },
        },
        bad: {
            title: 'END：青春の日々',
            messages: [
                { speaker: '', text: '卒業式が終わった。' },
                { speaker: '', text: '三年間……メガネを使って、自分を磨いてきた。それ自体は本物だ。' },
                { speaker: '', text: '誰かに告白することはできなかったけれど、後悔はしていない。' },
                { speaker: '', text: 'いつか、このメガネなしで誰かを好きになれる日が来るかもしれない。' },
                { speaker: '', text: '桜の花びらが、静かに舞い散っていた。' },
            ],
        },
    },
};
