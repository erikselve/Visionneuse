import { createSlice } from '@reduxjs/toolkit'

export const listeTagsSlice = createSlice({
    name: 'listeTagsComp',
    initialState: {categories: [], liens: {}},
    reducers: {
        initialise: (state, action) => {
            state.categories = action.payload
            state.liens = action.payload[0]?.liens ?? {}   // embarqué dans chaque catégorie : on prend la première, fallback vide
        },
        ajouteCategorie: (state, action) => {
            state.categories = [...state.categories, {categorie: action.payload, liste: []}]
        },
        majCategorie: (state, action) => {
            const index = state.categories.findIndex((elt) => elt.categorie === action.payload.categorie)
            state.categories[index].liste = action.payload.tags
        }
    }
})

export const {initialise, ajouteCategorie, majCategorie, ajouteTagImage, retireTagImage} = listeTagsSlice.actions

export default listeTagsSlice.reducer