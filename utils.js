/**
 * utils.js
 * Contient les fonctions utilitaires (formatage, notifications, audio).
 * Gère également le contexte audio.
 */

import { gameState } from './state.js';

let audioCtx = null;

export function formatNumber(num) {
    if (!isFinite(num)) return "∞";
    if (num === 0) return "0";
    
    const absNum = Math.abs(num);
    if (absNum < 1000) {
        return num % 1 === 0 ? num.toString() : parseFloat(num.toFixed(2)).toString();
    }

    const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "qad", "Qid", "sxd", "Spd", "Ocd", "Nod", "Vg", "Uvg", "Dvg", "Tvg", "qavg", "Qivg", "sxvg", "Spvg", "Ocvg", "Novg", "Tg", "Ct"];

    const suffixIndex = Math.floor(Math.log10(absNum) / 3);
    const safeIndex = Math.min(suffixIndex, suffixes.length - 1);
    const shortValue = num / Math.pow(1000, safeIndex);

    if (suffixIndex >= suffixes.length) {
        return num.toExponential(2).replace("+", "");
    }

    return parseFloat(shortValue.toFixed(2)) + suffixes[safeIndex];
}

export function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

export function addLog(message, type = "") {
    const container = document.getElementById("log-container");
    if (!container) return;

    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // Détection de spam : on vérifie si le dernier message inséré est identique
    const lastEntry = container.firstChild;
    if (lastEntry && lastEntry._rawMsg === message) {
        lastEntry._count = (lastEntry._count || 1) + 1;
        lastEntry.innerHTML = `<span style="opacity:0.5">[${time}]</span> ${message} <small style="opacity:0.7; font-weight:bold; color:#f1c40f; margin-left:5px;">(x${lastEntry._count})</small>`;
        return;
    }

    const entry = document.createElement("div");
    entry.className = `log-entry ${type ? 'log-' + type : ''}`;
    entry._rawMsg = message; // On stocke le message brut pour la comparaison future
    entry._count = 1;
    entry.innerHTML = `<span style="opacity:0.5">[${time}]</span> ${message}`;

    container.prepend(entry);
    if (container.childNodes.length > 25) container.lastChild.remove(); // Limite augmentée à 25
}

export function showNotification(message, type = "") {
    const container = document.getElementById("notification-container");
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2500);
}

export function handleError(error) {
    console.error("Game Error:", error);
    showNotification("⚠️ Une erreur est survenue. Le jeu continue, mais signalez-le au développeur !", "warning");
}

export function playSound(type) {
    if (gameState.isMuted) return;

    // S'assure que audioCtx est initialisé et non suspendu.
    // Il doit être initialisé par resumeAudioContext sur la première interaction utilisateur.
    if (!audioCtx || audioCtx.state === 'suspended') {
        // Tente de reprendre/initialiser. Si cela échoue, on ne peut pas jouer le son pour l'instant.
        resumeAudioContext(); 
        if (!audioCtx || audioCtx.state === 'suspended') return; // Toujours suspendu ou non initialisé, on sort
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch(type) {
        case 'click': osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
        case 'buy': osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.2); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
        case 'hornet': osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(50, now + 0.4); gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4); break;
        case 'collect': osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
        case 'golden': osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); break;
        case 'rain': osc.type = 'sine'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.5); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); osc.start(now); osc.stop(now + 0.5); break;
        case 'levelup': osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); break;
    }
}

export function resumeAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("AudioContext resumed successfully.");
        }).catch(e => {
            console.error("Échec de la reprise de l'AudioContext :", e);
        });
    }
}
