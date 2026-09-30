import { configureStore } from '@reduxjs/toolkit'
import indiceProgressionReducer from './slices/indiceProgressionSlice'
import mediasCompReducer from './slices/mediasCompSlice'
import listeTagsReducer from './slices/listeTagsSlice'
import displayReducer from './slices/displaySlice'
import sourcesReducer from './slices/sourceSlice'

export default configureStore({
  reducer: {
    indiceProgression: indiceProgressionReducer,
    mediasComp: mediasCompReducer,
    listeTags: listeTagsReducer,
    display: displayReducer,
    sources: sourcesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false//{
        // ignoredActions: [ajoute],
      //},
    })
})