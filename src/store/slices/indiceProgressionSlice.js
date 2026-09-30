import { createSlice } from '@reduxjs/toolkit'

export const indiceProgressionSlice = createSlice({
    name: 'indiceProgression',
    initialState: {tache: 'Aucune', actionsEffectuees: 0, objectif: 0},
    reducers: {
        changeTache: (state, action) => {
            state.tache = action.payload.nom
            state.actionsEffectuees = 0
            state.objectif = action.payload.objectif
        },
        augmenteObjectif: (state, action) => {
            state.objectif = state.objectif + action.payload
        },
        agir: (state) => {
            state.actionsEffectuees = state.actionsEffectuees+1
        }
    }
})

export const {changeTache, augmenteObjectif, agir} = indiceProgressionSlice.actions

export default indiceProgressionSlice.reducer