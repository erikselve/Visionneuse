import { createSlice } from '@reduxjs/toolkit'
import { infoAnimation, infoGraphisme, infoMiseEnScene, infoSon } from '../../data/source'

function tri(liste, critere, sens) {
    let action = true
    while (action) {
        action = false
        for (let index = 0; index < liste.length-1; index++) {
            if (sens > 0) {
                if (liste[index][critere] < liste[index+1][critere] ) {
                    let tampon = liste[index]
                    liste[index] = liste[index+1]
                    liste[index+1] = tampon
                    action = true
                }
            }
            else {
                if (liste[index][critere] > liste[index+1][critere] ) {
                    let tampon = liste[index]
                    liste[index] = liste[index+1]
                    liste[index+1] = tampon
                    action = true
                }
            }
        }                        
    }
    return liste
}

function calculeEval(source, max) {
    return (infoGraphisme[source.graphisme].valeur + infoAnimation[source.animation].valeur) * infoMiseEnScene[source.miseEnScene].valeur * infoSon[source.son].valeur * 100 / max
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
            liste = tri(liste, 'nom', -1)
            let listeNom = []
            listeNom.push('Inconnu')
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
                listeNom.push(element.nom)
            });
            state.listeNomAlphab = listeNom
            state.sources = action.payload
            if (state.derniereSourceUtilisee !== null)
                state.derniereSourceUtilisee = state.sources[state.sources.findIndex((elt) => elt.nom === state.derniereSourceUtilisee.nom)]
        },
        triSources: (state, action) => {
            state.sources = tri(state.sources, action.payload, state.sensTri)
            state.sensTri = state.sensTri * -1
        },
        changeDerniereSource: (state, action) => {
            state.derniereSourceUtilisee = state.sources[state.sources.findIndex((elt) => elt.nom === action.payload)]
        }
    }
})

export const {chargeSources, triSources, changeDerniereSource} = sourcesSlice.actions

export default sourcesSlice.reducer