import { createSlice } from '@reduxjs/toolkit'

export const displaySlice = createSlice({
    name: 'display',
    initialState: {barreProgression: false, diaporama: false, favoriSelec: null, princ: {gallerie: true, comparateur: false, gestionTags: false, sources: false}, mediaSelec: null, loading: false, boucle: false}, 
    reducers: {
        changeBarreProgression: (state) => {
            state.barreProgression = !state.barreProgression
        },
        changeDiaporama: (state) => {
            state.diaporama = !state.diaporama
        },
        changeFavori: (state, action) => {
            state.favoriSelec = action.payload
        },
        changePrinc: (state, action) => {
            switch (action.payload.panneau) {
                case 'gallerie':
                    state.princ.gallerie = true
                    state.princ.comparateur = false
                    state.princ.gestionTags = false
                    state.princ.sources = false
                    break;
                case 'comparateur':
                    state.princ.gallerie = false
                    state.princ.comparateur = true
                    state.princ.gestionTags = false
                    state.princ.sources = false
                    break;
                case 'gestionTags':
                    state.princ.gallerie = false
                    state.princ.comparateur = false
                    state.princ.gestionTags = true
                    state.princ.sources = false
                    break;
                case 'sources':
                    state.princ.gallerie = false
                    state.princ.comparateur = false
                    state.princ.gestionTags = false
                    state.princ.sources = true
                    break;
                default:
                    state.princ.gallerie = true
                    state.princ.comparateur = false
                    state.princ.gestionTags = false
                    state.princ.sources = false
                    break;
            }
        },
        selectionneMedia: (state, action) => {
            state.mediaSelec = action.payload
        },
        annuleSelection: (state, action) => {
            state.mediaSelec = null
        },
        changeLoading: (state, action) => {
            state.loading = !state.loading
        },
        setBoucle: (state, action) => {
            state.boucle = action.payload
        }
    }
})

export const {changeBarreProgression, changePrinc, selectionneMedia, annuleSelection, changeLoading, changeDiaporama, setBoucle, changeFavori} = displaySlice.actions

export default displaySlice.reducer