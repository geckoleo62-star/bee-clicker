/**
 * constants.js
 * Définit toutes les constantes et données statiques du jeu.
 * Ne doit pas contenir de logique métier ou de références directes à gameState.
 */

export const PROD_COMMON = 8; // Production par seconde d'une abeille commune
export const PROD_RARE = 25; // Production par seconde d'une abeille rare
export const PROD_LEGENDARY = 75; // Production par seconde d'une abeille légendaire
export const PROD_MYTHIC = 150; // Production par seconde d'une abeille mythique
export const PROD_DIVINE = 300; // Production par seconde d'une abeille divine

export const CLICK_MAX_LEVEL = 30;
export const BEE_COST_MULTIPLIER = 1.15; // Inflation du prix des abeilles

// Centralisation des taux pour éviter les doublons entre formulas.js et ui.js
export const FLOWER_BONUS_PRIMARY = 0.03;   // 3%
export const FLOWER_BONUS_SECONDARY = 0.05; // 5%

// Taux de bonus des améliorations (Magasin)
export const UPGRADE_RATES = {
    honeycomb: 0.02,
    dance: 0.02,
    filter: 0.02,
    mead: 0.03,
    hivenet: 0.03,
    wax: 0.04,
    jelly: 0.05,
    prestigeBoost: 0.05,
    gloves: 0.05,
    stinger: 0.06
};

export const ARTIFACT_RATES = {
    "Aiguillon": 0.05,
    "Vieux Pot": 0.10
};

export const WEATHER_TYPES = [
    { name: "Soleil", desc: "Production +25%", prod: 1.25, click: 1.0, weight: 45 },
    { name: "Pluie", desc: "Clic +50% | Prod -20%", prod: 0.8, click: 1.5, weight: 25 },
    { name: "Vent", desc: "Vitesse Auto +15%", prod: 1.0, click: 1.0, weight: 25 },
    { name: "Orage", desc: "Plus de frelons ! Prod -25%", prod: 0.75, click: 1.0, weight: 5 }
];

export const WEATHER_MAP = {
    "Pluie": "rain",
    "Orage": "storm",
    "Soleil": "sun",
    "Vent": "wind"
};

export const FLOWER_MILESTONES = {
    lavender: 0, sunflower: 3, rose: 5, daisy: 7, orchid: 10,
    lily: 12, tulip: 14, poppy: 17, lotus: 20, hibiscus: 25
};

export const BEE_INFO = {
    common: { name: "Commune", icon: "🐝", desc: "L'ouvrière de base. Travaille dur et ne se plaint jamais.", prod: PROD_COMMON },
    rare: { name: "Rare", icon: "🐝", desc: "Un peu plus colorée, elle butine avec plus de style.", prod: PROD_RARE },
    legendary: { name: "Légendaire", icon: "🐝", desc: "Ses ailes brillent d'une lueur dorée. Une star.", prod: PROD_LEGENDARY },
    mythic: { name: "Mythique", icon: "🐝", desc: "On dit qu'elle connaît le secret de la gelée pure.", prod: PROD_MYTHIC },
    divine: { name: "Divine", icon: "🐝", desc: "Une entité céleste. Produit du miel qui soigne l'âme.", prod: PROD_DIVINE },
    golden: { name: "Abeille d'Or", icon: "🐝", desc: "Une messagère mystique qui n'apparaît que rarement pour bénir la ruche de sa frénésie." },
    hornet: { name: "Frelon", icon: "🐝", desc: "Un prédateur redoutable. Le chasser est le seul moyen d'obtenir des ingrédients alchimiques." }
};

export const POTION_RECIPES = { // Recettes des potions
    honey: { water: 40, petals: 60, nectar: 20, hpsMultiplier: 300 }, // 5 minutes de HPS (300 secondes)
    click: { water: 25, petals: 40, nectar: 10, hpsMultiplier: 120 }, // 2 minutes de HPS (120 secondes)
    luck: { water: 100, petals: 150, nectar: 50, hpsMultiplier: 900 } // 15 minutes de HPS (900 secondes)
};

export const DONATOR_CODES = {
    "MECENE2024": { tier: 1, message: "Code Mécène activé ! 👑" },
    "DIVINITY":    { tier: 2, message: "Code Mécène Divin activé ! ✨" },
    "ROYALTY":     { tier: 3, message: "Code Souverain activé ! 🎨" },
    "ULTIMATE":    { tier: 4, message: "Code Bienfaiteur Suprême activé ! ⚡" }
};

// Équilibrage Abeille d'Or
export const GOLDEN_BEE_REWARD_SECONDS = 10; // Secondes de production offertes
export const GOLDEN_BEE_FRENZY_DURATION = 12; // Durée de la frénésie en secondes
export const FRENZY_PROD_MULTIPLIER = 5;      // Multiplicateur de production pendant la frénésie
