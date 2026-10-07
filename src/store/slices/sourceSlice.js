import { createSlice } from '@reduxjs/toolkit'
import { infoAnimation, infoGraphisme, infoMiseEnScene, infoSon } from '../../data/source'

const COEF_FAVORI = 0.1   // bonus max +10% : une source dont tous les médias sont favoris

function calculeEval(source, max) {
    if (source.graphisme === null || source.animation === null || source.miseEnScene === null || source.son === null) return 0
    const base = (infoGraphisme[source.graphisme].valeur + infoAnimation[source.animation].valeur)
        * infoMiseEnScene[source.miseEnScene].valeur * infoSon[source.son].valeur * 100 / max
    return base * (1 + COEF_FAVORI * (source.partFavoris || 0))
}

function calculeUrgence(source) {
    return source.urgence * source.evaluation / 100 
}

export const sourcesSlice = createSlice({
    name: 'sources',
    initialState: {plusGrandeUrgence: 0, sensTri: 1, derniereSourceUtilisee: null, listeNomAlphab:[], sources: []}, //chaque elt contient {nom:'', animation:0, graphisme:0, son:0, miseEnScene:0, derniereConsult: date, urgence:0}
    reducers: {
        chargeSources: (state, action) => {
            const max = (infoGraphisme[infoGraphisme.length-1].valeur + infoAnimation[infoAnimation.length-1].valeur) * infoMiseEnScene[infoMiseEnScene.length-1].valeur * infoSon[infoSon.length-1].valeur
            let liste = [...action.payload]
            liste.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
            let listeNom = []
            listeNom.push({nom: 'Inconnu', manuel: false})
            state.plusGrandeUrgence = 0

            liste.forEach(element => {
                if (element.notesCalculees !== undefined) {
                    Object.keys(element.notesCalculees).forEach(critere => {
                        element[critere] = element.notesCalculees[critere]
                    })
                }
                element.evaluation = calculeEval(element, max)
                element.urgence = calculeUrgence(element)
                if (element.urgence > state.plusGrandeUrgence) state.plusGrandeUrgence = element.urgence
                listeNom.push({nom: element.nom, manuel: element.origines.find((origine) => origine.nom === 'manuel') !== undefined})
            });
            state.listeNomAlphab = listeNom
            state.sources = action.payload
            if (state.derniereSourceUtilisee !== null) {
                const index = state.sources.findIndex((elt) => elt.nom === state.derniereSourceUtilisee.nom)
                state.derniereSourceUtilisee = (index >= 0)?state.sources[index]:null
            }
        },
        triSources: (state, action) => {
            state.sources = [...state.sources].sort((a, b) => state.sensTri * (b[action.payload] - a[action.payload])) //tri de la liste
            state.sensTri = state.sensTri * -1
        },
        changeDerniereSource: (state, action) => {
            const index = state.sources.findIndex((elt) => elt.nom === action.payload)
            state.derniereSourceUtilisee = (index >= 0)?state.sources[index]:null
        }
    }
})

export const {chargeSources, triSources, changeDerniereSource} = sourcesSlice.actions

export default sourcesSlice.reducer