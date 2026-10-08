import { createSlice } from '@reduxjs/toolkit'

const COEF_FAVORI = 0.1   // bonus max +10% : une source dont tous les médias sont favoris

export const sourcesSlice = createSlice({
    name: 'sources',
    initialState: {plusGrandeUrgence: 0, sensTri: 1, derniereSourceUtilisee: null, listeNomAlphab:[], sources: [], notation: null}, 
    reducers: {
        chargeSources: (state, action) => {
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
        },
        chargeNotation: (state, action) => { 
            state.notation = action.payload
        }
    }
})

export const {chargeSources, triSources, changeDerniereSource, chargeNotation} = sourcesSlice.actions

export default sourcesSlice.reducer