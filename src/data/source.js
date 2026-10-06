export const infoGraphisme = [{msg: 'Pas à mon goût, pas grand chose à sauver', valeur: 0}, 
    {msg: 'Des éléments sympas dans un ensemble médiocre au mieux', valeur: 5}, 
    {msg: 'Pas trop mal', valeur: 8},
    {msg: 'Plutôt bien mais peut mieux faire', valeur: 13},
    {msg: 'Vraiment beau même si on peut encore détecter quelques défauts', valeur: 17},
    {msg: 'La perfection ou presque', valeur: 20}
]

export const infoAnimation = [{msg: 'Pas terrible', valeur: 5}, 
    {msg: 'Pas mal mais il y a des défauts (saccades, gestes peu naturels, collisions plutôt visibles)', valeur: 10}, 
    {msg: 'Bien animé', valeur: 17},
    {msg: 'Bien animé avec des petits détails qui ajoutent au réalisme', valeur: 20},
]

export const infoMiseEnScene = [{msg: 'Un geste sexuel répété sans plus', valeur: 0.7},
    {msg: 'On peut imaginer une situation excitante mais rien n\'est vraiment explicite', valeur: 0.9},
    {msg: 'La scène sexuelle est rapidement mise en scène dans une situation excitante', valeur: 1},
    {msg: 'La scène est scénarisée et/ou une ambiance est présente', valeur: 1.05},
    {msg: 'L\'excitation est parachevée par une bonne scénarisation et/ou ambiance', valeur: 1.15},
    {msg: 'Rien que d\'y penser génère des sensations. Excellent!', valeur: 1.25}
]

export const infoSon = [{msg: 'Pas de son', valeur: 0.1}, 
    {msg: 'Qualité discutable', valeur: 0.6},
    {msg: 'Pas de soucis en soi mais potentiellement incomplet (pas de doublage par exemple)', valeur: 1},
    {msg: 'Scène doublée, ambiance sonore, pas de défaut particulier à signaler', valeur: 1.05}
]

export const criteresParType = {
    video: ['graphisme', 'animation', 'miseEnScene', 'son'],
    image: ['graphisme', 'miseEnScene'],
    album: ['graphisme', 'miseEnScene']
}