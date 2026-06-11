/**
 * storage.js
 * Gère la persistance des données (sauvegarde, chargement, export/import).
 */

import { gameState, internalVars } from './state.js';
import * as Utils from './utils.js';
import * as Formulas from './formulas.js';
import * as UI from './ui.js';
import { startAutoclickLoop } from './gameLogic.js'; // Import pour redémarrer l'autoclick après chargement

export const SAVE_DEBOUNCE_MS = 500;

export function saveGame() {
    if (internalVars.isResetting) return;
    gameState.lastSaveTime = Date.now();
    localStorage.setItem("beeClickerSave", JSON.stringify(gameState));
}

export function queueSave() {
    if (internalVars.saveTimeout !== null) clearTimeout(internalVars.saveTimeout);
    internalVars.saveTimeout = setTimeout(() => {
        internalVars.saveTimeout = null;
        saveGame();
    }, SAVE_DEBOUNCE_MS);
}

export function flushSave() {
    if (internalVars.saveTimeout !== null) {
        clearTimeout(internalVars.saveTimeout);
        internalVars.saveTimeout = null;
    }
    saveGame();
}

export function loadGame() {
    let save = localStorage.getItem("beeClickerSave");

    if (save === null) {
        const oldSave = localStorage.getItem("bee_clicker_save");
        if (oldSave !== null) {
            save = oldSave;
            localStorage.setItem("beeClickerSave", save);
        }
    }

    if (save !== null) {
        try {
            if (save === "undefined" || save === "null") throw new Error("Save string invalid");
            const loadedData = JSON.parse(save);
            
            Object.assign(gameState, { 
                ...gameState, 
                ...loadedData,
                ingredients: { ...gameState.ingredients, ...(loadedData.ingredients || {}) },
                potions: { ...gameState.potions, ...(loadedData.potions || {}) },
                discoveredBees: { ...gameState.discoveredBees, ...(loadedData.discoveredBees || {}) },
                activePotions: { honey: 0, click: 0, luck: 0, frenzy: 0 }
            });

            gameState.buyAmount = 1;
            if (!gameState.highestHoneyEver) gameState.highestHoneyEver = gameState.maxHoneyReached;

            const now = Date.now();
            let diff = (now - (gameState.lastSaveTime || now)) / 1000;
            if (diff > 60) {
                // Cap à 8 heures (28800 secondes) pour l'équilibrage
                const isCapped = diff > 28800;
                diff = Math.min(diff, 28800);

                const hps = Formulas.getBaseCps() * Formulas.getPrestigeMultiplier();
                const offlineGains = hps * diff * 0.5;
                if (offlineGains > 0) {
                    Formulas.addHoney(offlineGains);
                    const msg = isCapped ? `🌙 Bon retour ! Gain max (8h) : ${Utils.formatNumber(offlineGains)} 🍯` : `🌙 Bon retour ! Gain hors-ligne : ${Utils.formatNumber(offlineGains)} 🍯`;
                    setTimeout(() => Utils.showNotification(msg), 1000);
                }
            }
            UI.renderArtifacts();
            startAutoclickLoop(); // Redémarre l'autoclick après le chargement
        } catch (e) {
            console.error("Échec du chargement de la sauvegarde :", e);
        }
    }
}

export function exportSave() {
    const saveData = localStorage.getItem('beeClickerSave');
    if (!saveData) return Utils.showNotification("❌ Aucune sauvegarde trouvée.", "warning");
    
    const encoded = btoa(unescape(encodeURIComponent(saveData)));
    
    navigator.clipboard.writeText(encoded);

    const blob = new Blob([encoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sauvegarde_bee_clicker_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    Utils.showNotification("💾 Sauvegarde téléchargée ! (Et copiée dans votre presse-papier : faites 'Coller' pour la voir)");
}

export function importSave() {
    const code = prompt("Collez votre code de sauvegarde ici :");
    if (!code) return;

    try {
        const decoded = decodeURIComponent(escape(atob(code)));
        JSON.parse(decoded);
        if (confirm("Charger cette sauvegarde ? Votre progression actuelle sera écrasée.")) {
            localStorage.setItem('beeClickerSave', decoded);
            window.location.reload();
        }
    } catch (e) {
        Utils.showNotification("⚠️ Code de sauvegarde invalide ou corrompu.", "warning");
    }
}