/* ============================================
   メイン制御
   ============================================ */

(function() {
    'use strict';

    function init() {
        GameEngine.init();
        UI.initTitle();
        bindEvents();
    }

    function bindEvents() {
        // タイトル
        document.getElementById('btn-newgame').addEventListener('click', startNewGame);
        document.getElementById('btn-loadgame').addEventListener('click', () => UI.showSaveLoad('load'));
        document.getElementById('btn-gallery').addEventListener('click', () => UI.showGallery());

        // ADVテキストクリック
        document.getElementById('text-window').addEventListener('click', onTextClick);

        // ADV UIボタン
        document.getElementById('btn-save').addEventListener('click', () => UI.showSaveLoad('save'));
        document.getElementById('btn-load').addEventListener('click', () => UI.showSaveLoad('load'));
        document.getElementById('btn-status').addEventListener('click', () => UI.showStatus());
        document.getElementById('btn-backlog').addEventListener('click', () => UI.showBacklog());

        // 育成画面
        document.getElementById('btn-training-status').addEventListener('click', () => UI.showStatus());
        document.getElementById('btn-training-save').addEventListener('click', () => UI.showSaveLoad('save'));

        // 各種閉じるボタン
        document.getElementById('btn-status-close').addEventListener('click', () => {
            UI.showScreen(GameEngine.state.phase === 'training' ? 'training-screen' : 'adv-screen');
        });
        document.getElementById('btn-saveload-close').addEventListener('click', () => UI.closeSaveLoad());
        document.getElementById('btn-gallery-close').addEventListener('click', () => UI.initTitle());
        document.getElementById('btn-backlog-close').addEventListener('click', () => UI.closeBacklog());

        // キーボード
        document.addEventListener('keydown', onKeyDown);
    }

    async function startNewGame() {
        GameEngine.resetState();
        // 最初のイベント（メガネ発見プロローグ）
        const firstEvent = ScenarioData.fixedEvents['y1_m4_w1'][0];
        await UI.startADV(firstEvent);
    }

    function onTextClick() {
        if (GameEngine.state.waitingForChoice) return;
        if (GameEngine.state.isTyping) { UI.skipTypeText(); return; }

        const scenario = GameEngine.state.currentScenario;
        if (!scenario) return;

        // エンディングシーン最終メッセージ
        if (scenario.isEndingScene && GameEngine.state.messageIndex >= scenario.messages.length - 1) {
            GameEngine.state.messageIndex++;
            UI.hideCG();
            UI.hideAllCharacters();
            UI.showEndingCard(scenario.endingData, scenario.endingType, scenario.endingHeroine);
            return;
        }

        GameEngine.state.messageIndex++;
        UI.showNextMessage();
    }

    function onKeyDown(e) {
        switch (e.key) {
            case ' ':
            case 'Enter':
                if (GameEngine.state.currentScreen === 'adv-screen') onTextClick();
                break;
            case 'Escape':
                if (['status-screen','saveload-screen','backlog-screen'].includes(GameEngine.state.currentScreen)) {
                    UI.showScreen(GameEngine.state.phase === 'training' ? 'training-screen' : 'adv-screen');
                }
                break;
            case 's':
                if (e.ctrlKey) { e.preventDefault(); UI.showSaveLoad('save'); }
                break;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
