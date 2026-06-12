import { gameState, internalVars } from './state.js';
import * as Constants from './constants.js';
import * as Utils from './utils.js';
import * as Formulas from './formulas.js';
import * as UI from './ui.js';
import * as Storage from './storage.js';
import * as GameLogic from './gameLogic.js';

// --- 1. INITIALISATION ---
function init() {
    console.log("%c 🍯 BEE CLICKER : Fichiers mis à jour chargés ! ", "background: #f1c40f; color: #000; font-weight: bold;");

    // Gestionnaire d'erreurs global pour la version publique
    window.onerror = (msg, url, line) => {
        Utils.handleError(`${msg} at ${line}`);
        return false;
    };

    UI.cacheDOM();
    Storage.loadGame();
    GameLogic.startAutoclickLoop();
    UI.updateDisplay();
    UI.renderMissions();
    GameLogic.scheduleNextRain(true);
    internalVars.isInitialRender = false;
    
    // --- 2. BOUCLE PRINCIPALE ---
    setInterval(() => {
        const now = Date.now();
        const delta = (now - internalVars.lastTickTime) / 1000;
        internalVars.lastTickTime = now;

        if (delta <= 0) return;
        gameState.totalPlayTime += delta;

        const hps = Formulas.getBaseCps() * Formulas.getPrestigeMultiplier();
        if (hps > 0) Formulas.addHoney(hps * delta);
        
        for (let key in gameState.activePotions) {
            if (gameState.activePotions[key] > 0) {
                gameState.activePotions[key] = Math.max(0, gameState.activePotions[key] - delta);
            }
        }
        UI.updateDisplay();
    }, 100);

    // --- 3. ÉCOUTEURS D'ÉVÉNEMENTS ---
    document.getElementById("click-btn")?.addEventListener("click", Formulas.handleManualClick);
    document.getElementById("btn-buy-bee")?.addEventListener("click", Formulas.buyBee);
    document.getElementById("hornet")?.addEventListener("click", GameLogic.handleHornetClick);

    // Gestion des modes et options UI
    document.getElementById("btn-wide-mode")?.addEventListener("click", () => {
        gameState.isLargeMode = !gameState.isLargeMode;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-dark-mode")?.addEventListener("click", () => {
        gameState.isDarkMode = !gameState.isDarkMode;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-mute")?.addEventListener("click", () => {
        gameState.isMuted = !gameState.isMuted;
        UI.updateDisplay();
        Storage.queueSave();
    });

    document.getElementById("btn-fullscreen")?.addEventListener("click", () => {
        UI.toggleFullScreen();
        // toggleFullScreen appelle déjà updateDisplay en interne
        Storage.queueSave();
    });

    // Fermeture des modales
    document.getElementById("close-stats")?.addEventListener("click", () => {
        document.getElementById("stats-modal")?.classList.add("hidden");
    });

    document.getElementById("btn-stats")?.addEventListener("click", () => {
        UI.setTxt("stat-total-honey", Utils.formatNumber(gameState.totalHoneyProduced));
        UI.setTxt("stat-total-clicks", gameState.totalClicksHistorical);
        UI.setTxt("stat-total-bees", Formulas.getTotalBees());
        UI.setTxt("stat-total-flowers", Formulas.getTotalFlowers());
        UI.setTxt("stat-total-hornets", gameState.totalHornetsHistorical);
        UI.setTxt("stat-total-time", Utils.formatTime(gameState.totalPlayTime));
        UI.setTxt("stat-total-ascensions", gameState.royalJelly);
        UI.setTxt("stat-total-artifacts", gameState.totalArtifactsHistorical);
        UI.setTxt("stat-total-potions", gameState.totalPotionsCraftedHistorical);
        document.getElementById("stats-modal")?.classList.remove("hidden");
    });

    document.getElementById("btn-buy-click")?.addEventListener("click", () => Formulas.performBulkPurchase(
        'clickCost', 'clickLevel', 1.35, "🌸 Clic amélioré ! Puissance +1", 
        (bought) => Formulas.addExp(10 * bought),
        Constants.CLICK_MAX_LEVEL
    ));

    Object.keys(Constants.FLOWER_MILESTONES).forEach(flowerId => {
        document.getElementById(`btn-buy-${flowerId}`)?.addEventListener("click", () => Formulas.performBulkPurchase(
            `${flowerId}Cost`, `${flowerId}Lvl`, 1.3, `🪻 ${flowerId.charAt(0).toUpperCase() + flowerId.slice(1)} plantée !`,
            (bought) => gameState.flowersPlanted += bought
        ));
    });

    document.querySelectorAll('[id^="btn-buy-pot-"]').forEach(btn => {
        btn.addEventListener("click", () => Formulas.buyPotion(btn.id.replace('btn-buy-pot-', '')));
    });
    document.querySelectorAll('[id^="btn-use-pot-"]').forEach(btn => {
        btn.addEventListener("click", () => Formulas.usePotion(btn.id.replace('btn-use-pot-', '')));
    });

    document.getElementById("btn-buy-honeycomb")?.addEventListener("click", () => Formulas.performBulkPurchase('honeycombCost', 'honeycombLvl', 1.35, "🧱 Rayons renforcés ! Prod +2%", () => Utils.playSound('buy')));
    document.getElementById("btn-buy-dance")?.addEventListener("click", () => Formulas.performBulkPurchase('danceCost', 'danceLvl', 1.4, "💃 Danse ! Prod +2%"));
    document.getElementById("btn-buy-gloves")?.addEventListener("click", () => Formulas.performBulkPurchase('glovesCost', 'glovesLvl', 1.45, "🧤 Gants ! Clic +5%"));
    document.getElementById("btn-buy-nectar")?.addEventListener("click", () => Formulas.performBulkPurchase('nectarCost', 'nectarLvl', 1.35, "🧪 Nectar ! Chance +0.1"));
    document.getElementById("btn-buy-filter")?.addEventListener("click", () => Formulas.performBulkPurchase('filterCost', 'filterLvl', 1.4, "🌪️ Filtre ! Prod +2%"));
    document.getElementById("btn-buy-mead")?.addEventListener("click", () => Formulas.performBulkPurchase('meadCost', 'meadLvl', 1.4, "🍷 Hydromel ! Prod +3%"));
    document.getElementById("btn-buy-stinger")?.addEventListener("click", () => Formulas.performBulkPurchase('stingerCost', 'stingerLvl', 1.45, "🗡️ Dard ! Clic +6%"));
    document.getElementById("btn-buy-hivenet")?.addEventListener("click", () => Formulas.performBulkPurchase('hivenetCost', 'hivenetLvl', 1.5, "🌐 Réseau ! Prod +3%"));
    document.getElementById("btn-buy-wax")?.addEventListener("click", () => Formulas.performBulkPurchase('waxCost', 'waxLvl', 1.5, "🕯️ Cire ! Prod +4%"));
    document.getElementById("btn-buy-jelly")?.addEventListener("click", () => Formulas.performBulkPurchase('jellyCost', 'jellyLvl', 1.6, "🧪 Gelée ! Prod +5%"));
    document.getElementById("btn-buy-prestige-boost")?.addEventListener("click", () => Formulas.performBulkPurchase('prestigeBoostCost', 'prestigeBoostLevel', 1.4, "🧬 Phéromones ! Global +5%"));
    
    document.getElementById("btn-force-rain")?.addEventListener("click", () => {
        GameLogic.forceRain();
        UI.updateDisplay();
        Storage.queueSave();
    });


    document.getElementById("buy-mastery-click")?.addEventListener("click", () => {
        let amountToBuy = gameState.buyAmount === -1 ? gameState.masteryPoints : gameState.buyAmount;
        if (gameState.masteryPoints >= amountToBuy && amountToBuy > 0) {
            gameState.masteryPoints -= amountToBuy;
            gameState.masteryClickBonus += amountToBuy;
            Utils.showNotification(`⚡ Maîtrise Céleste : Clic de base +${amountToBuy} !`);
            UI.updateDisplay(); Storage.queueSave();
        } else { Utils.showNotification("Points de maîtrise insuffisants."); }
    });

    document.getElementById("buy-mastery-luck")?.addEventListener("click", () => {
        if (Formulas.getTotalLuck() >= Formulas.MAX_LUCK_CAP) {
            Utils.showNotification("Chance déjà au maximum ! ✨", "warning");
            return;
        }

        let amountToBuy = gameState.buyAmount === -1 ? gameState.masteryPoints : gameState.buyAmount;
        if (gameState.masteryPoints >= amountToBuy && amountToBuy > 0) {
            gameState.masteryPoints -= amountToBuy;
            gameState.masteryLuckBonus += (amountToBuy * 0.1); // Réduit de 0.25 à 0.1
            Utils.showNotification(`✨ Maîtrise Céleste : Chance augmentée de +${(amountToBuy * 0.1).toFixed(1)} !`);
            UI.updateDisplay(); Storage.queueSave();
        } else { Utils.showNotification("Points de maîtrise insuffisants."); }
    });

    const buyAmounts = [1, 10, 25, 50, 100];
    buyAmounts.forEach(amount => {
        document.getElementById(`buy-x${amount}`)?.addEventListener("click", () => {
            gameState.buyAmount = amount;
            UI.updateDisplay();
            Storage.queueSave();
        });
    });
    document.getElementById("buy-max")?.addEventListener("click", () => {
        gameState.buyAmount = -1;
        UI.updateDisplay();
        Storage.queueSave();
    });

    // Gestion des onglets
    UI.ui["tab-shop"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-shop"], UI.ui["shop-view"]));
    UI.ui["tab-garden"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-garden"], UI.ui["garden-view"]));
    UI.ui["tab-beedex"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-beedex"], UI.ui["beedex-view"]));
    UI.ui["tab-potions"]?.addEventListener("click", () => UI.switchTab(UI.ui["tab-potions"], UI.ui["potion-view"]));

    document.getElementById("prestige-btn")?.addEventListener("click", () => {
        if (Formulas.prestige()) {
            GameLogic.startAutoclickLoop();
            UI.renderMissions();
            UI.updateDisplay();
        }
    });

    document.getElementById("reset-btn")?.addEventListener("click", Formulas.resetGame);
    document.getElementById('btn-export')?.addEventListener('click', Storage.exportSave);
    document.getElementById('btn-import')?.addEventListener("click", Storage.importSave);
    
    // Correction de l'ID pour correspondre au HTML (btn-secret-code)
    document.getElementById('btn-secret-code')?.addEventListener("click", () => {
        console.log("Bouton code cliqué"); // Debug pour vérifier dans la console (F12)
        // On force l'utilisation du prompt pour être sûr que ça fonctionne
        Formulas.redeemCode();
    });

    // --- 4. BOUCLES D'ÉVÉNEMENTS ALÉATOIRES ET SAUVEGARDE ---
    // La gestion des frelons est maintenant dans GameLogic.js et dépend de la météo
    setInterval(() => { if (Math.random() < 0.20) GameLogic.spawnGoldenBee(); }, 40000);
    setInterval(GameLogic.updateWeather, 120000);
    setInterval(Storage.saveGame, 10000);
    setInterval(GameLogic.handleDonatorAutoLoot, 1000);

    // Messages d'accueil
    setTimeout(() => Utils.addLog("ℹ️ Bee Clicker prêt !", "info"), 1000);
}

document.addEventListener('click', Utils.resumeAudioContext, { once: true });

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") Storage.flushSave();
});
window.addEventListener("beforeunload", Storage.flushSave);

window.onload = init;
