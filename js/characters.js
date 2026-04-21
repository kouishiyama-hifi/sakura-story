/* ============================================
   キャラクター定義
   画像ファイルは images/ フォルダに配置してください
   README: images/README.md 参照
   ============================================ */

const Characters = {
    heroines: {
        sakuragi: {
            id: 'sakuragi',
            name: '桜木 彩華',
            nameShort: '彩華',
            color: '#FF80AB',
            description: '学園のマドンナ。容姿端麗で成績優秀、誰もが憧れる高嶺の花。',
            personality: '凛としていて近寄りがたい雰囲気があるが、実は寂しがり屋な一面も。',
            likes: '紅茶、クラシック音楽、読書',
            trait: 'elegant',
            requiredStats: { charm: 40, culture: 30 },
            // メガネ外したときの「本当の姿」の説明（画像差し込み用）
            trueAppearance: 'ふくよかな体型、どことなく素朴な顔立ちだが、瞳だけはとても温かい',
        },
        fumino: {
            id: 'fumino',
            name: '文野 栞',
            nameShort: '栞',
            color: '#90CAF9',
            description: '幼馴染の文学少女。おとなしくて控えめだが、成績は常にトップクラス。',
            personality: '物静かで穏やか。本の世界が大好きで、図書室が居場所。主人公には心を開いている。',
            likes: '読書、詩、猫、静かな場所',
            trait: 'gentle',
            requiredStats: { study: 40, culture: 30 },
            trueAppearance: '太い黒縁メガネ、くせのある髪、地味な印象だが、読書家らしい深い目をしている',
        },
        hinata: {
            id: 'hinata',
            name: '日向 陽葵',
            nameShort: '陽葵',
            color: '#FFB74D',
            description: '元気いっぱいのスポーツ少女。褐色の肌とショートカットがトレードマーク。',
            personality: '明るく活発で、裏表のない性格。友達思いで、困っている人を放っておけない。',
            likes: 'スポーツ全般、カレー、冒険',
            trait: 'energetic',
            requiredStats: { sports: 40, stamina: 40 },
            trueAppearance: 'がっしりした体格、きつめの顔立ちだが、笑うとこれ以上ないほど真っ直ぐな笑顔',
        },
    },

    /* --------------------------------------------------
       キャラクター立ち絵を返す
       画像ファイルが存在すれば <img> を表示
       なければスタイル付きプレースホルダーを表示
    -------------------------------------------------- */
    drawCharacter(heroineId, expression) {
        const heroine = this.heroines[heroineId];
        if (!heroine) return '';

        const isTrue = (expression === 'true'); // メガネ外し後の真の姿
        const imgSrc = isTrue
            ? `images/characters/${heroineId}_true.png`
            : `images/characters/${heroineId}_${expression || 'normal'}.png`;

        return `
            <div class="char-img-wrap" data-char="${heroineId}" data-expr="${expression}">
                <img
                    src="${imgSrc}"
                    alt="${heroine.name}"
                    class="char-img${isTrue ? ' char-img--true' : ''}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                <div class="char-placeholder" style="display:none; border-color:${heroine.color};">
                    <span class="char-placeholder__name" style="color:${heroine.color};">${heroine.nameShort}</span>
                    <span class="char-placeholder__expr">${isTrue ? '真の姿' : expression || 'normal'}</span>
                </div>
            </div>`;
    },

    /* --------------------------------------------------
       イベントCG を返す
       画像があれば <img>、なければプレースホルダー
    -------------------------------------------------- */
    drawEventCG(cgId) {
        const meta = this.cgMeta[cgId];
        if (!meta) return '';

        return `
            <div class="cg-wrap" data-cg="${cgId}">
                <img
                    src="images/cg/${meta.file}"
                    alt="${meta.title}"
                    class="cg-img"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >
                <div class="cg-placeholder" style="display:none; background:${meta.bgFallback};">
                    <span class="cg-placeholder__title">${meta.title}</span>
                </div>
            </div>`;
    },

    /* --------------------------------------------------
       背景を返す
    -------------------------------------------------- */
    drawBackground(bgId) {
        const bg = this.bgMeta[bgId] || { file: '', cssClass: bgId, title: bgId };
        return { cssClass: bg.cssClass, imgSrc: bg.file ? `images/backgrounds/${bg.file}` : '' };
    },

    /* --------------------------------------------------
       CG メタデータ
    -------------------------------------------------- */
    cgMeta: {
        // ─── メガネ関連 ───
        'cg_glasses_found':       { file: 'glasses_found.png',      title: '不思議なメガネ',      bgFallback: 'linear-gradient(135deg,#1a0a2e,#4a1a6b)' },
        'cg_glasses_numbers':     { file: 'glasses_numbers.png',     title: '浮かび上がる数字',    bgFallback: 'linear-gradient(135deg,#0d0221,#1a237e)' },

        // ─── 通常イベント ───
        'cg_sakuragi_meet':       { file: 'sakuragi_meet.png',       title: '桜の下での出会い',    bgFallback: 'linear-gradient(180deg,#FCE4EC,#F48FB1)' },
        'cg_fumino_library':      { file: 'fumino_library.png',      title: '図書室の約束',        bgFallback: 'linear-gradient(180deg,#5D4037,#8D6E63)' },
        'cg_hinata_run':          { file: 'hinata_run.png',          title: 'グラウンドの笑顔',    bgFallback: 'linear-gradient(180deg,#64B5F6,#A5D6A7)' },
        'cg_sakuragi_rooftop':    { file: 'sakuragi_rooftop.png',    title: '夕暮れの屋上',        bgFallback: 'linear-gradient(180deg,#FF6F00,#FFC107)' },
        'cg_fumino_rain':         { file: 'fumino_rain.png',         title: '雨の日の涙',          bgFallback: 'linear-gradient(180deg,#546E7A,#90A4AE)' },
        'cg_hinata_sunset':       { file: 'hinata_sunset.png',       title: '夕焼けの告白',        bgFallback: 'linear-gradient(180deg,#E65100,#FFC107)' },
        'cg_sakuragi_festival':   { file: 'sakuragi_festival.png',   title: '文化祭の夜',          bgFallback: 'linear-gradient(180deg,#1a0a2e,#4A148C)' },
        'cg_fumino_starry':       { file: 'fumino_starry.png',       title: '星降る夜に',          bgFallback: 'linear-gradient(180deg,#0d0221,#2d1b69)' },
        'cg_hinata_beach':        { file: 'hinata_beach.png',        title: '夏の海',              bgFallback: 'linear-gradient(180deg,#039BE5,#FFE082)' },

        // ─── エンディング（通常バージョン） ───
        'cg_sakuragi_ending':     { file: 'sakuragi_ending.png',     title: '永遠の花',            bgFallback: 'linear-gradient(180deg,#FCE4EC,#EC407A)' },
        'cg_fumino_ending':       { file: 'fumino_ending.png',       title: '物語の続き',          bgFallback: 'linear-gradient(180deg,#E3F2FD,#42A5F5)' },
        'cg_hinata_ending':       { file: 'hinata_ending.png',       title: '太陽と共に',          bgFallback: 'linear-gradient(180deg,#FFF3E0,#FF9800)' },

        // ─── 真エンディング（メガネ外し後） ───
        'cg_sakuragi_true_end':   { file: 'sakuragi_true_end.png',   title: '素顔の彩華',          bgFallback: 'linear-gradient(180deg,#880E4F,#FCE4EC)' },
        'cg_fumino_true_end':     { file: 'fumino_true_end.png',     title: '素顔の栞',            bgFallback: 'linear-gradient(180deg,#1565C0,#E3F2FD)' },
        'cg_hinata_true_end':     { file: 'hinata_true_end.png',     title: '素顔の陽葵',          bgFallback: 'linear-gradient(180deg,#E65100,#FFF3E0)' },
    },

    /* --------------------------------------------------
       背景メタデータ
    -------------------------------------------------- */
    bgMeta: {
        'bg-classroom':   { file: 'bg_classroom.png',   cssClass: 'bg-classroom',   title: '教室' },
        'bg-schoolyard':  { file: 'bg_schoolyard.png',  cssClass: 'bg-schoolyard',  title: '校庭' },
        'bg-rooftop':     { file: 'bg_rooftop.png',     cssClass: 'bg-rooftop',     title: '屋上' },
        'bg-library':     { file: 'bg_library.png',     cssClass: 'bg-library',     title: '図書室' },
        'bg-gym':         { file: 'bg_gym.png',         cssClass: 'bg-gym',         title: '体育館' },
        'bg-park':        { file: '',                   cssClass: 'bg-park',        title: '公園' },
        'bg-sunset':      { file: 'bg_winter.png',      cssClass: 'bg-sunset',      title: '夕暮れ' },
        'bg-sakura':      { file: 'bg_sakura.png',      cssClass: 'bg-sakura',      title: '桜' },
        'bg-night':       { file: 'bg_winter.png',      cssClass: 'bg-night',       title: '夜' },
        'bg-hallway':     { file: 'bg_classroom.png',   cssClass: 'bg-hallway',     title: '廊下' },
        'bg-festival':    { file: 'bg_festival.png',    cssClass: 'bg-festival',    title: '祭り' },
        'bg-graduation':  { file: 'bg_graduation.png',  cssClass: 'bg-graduation',  title: '卒業式' },
        'bg-beach':       { file: 'bg_beach.png',       cssClass: 'bg-beach',       title: '海' },
        'bg-pool':        { file: 'bg_pool.png',        cssClass: 'bg-pool',        title: 'プール' },
        'bg-winter':      { file: 'bg_winter.png',      cssClass: 'bg-winter',      title: '冬' },
        'bg-dark':        { file: '',                   cssClass: 'bg-dark',        title: '暗闇' },
    },
};
