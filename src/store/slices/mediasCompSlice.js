import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetch_json } from '../../modules/com'

// Envoi de la décision au back (retireDouble) : suppression des doublons cochés + sauvegarde
// (ou destruction, si mediaBase) du média en attente. C'est aussi ce qui SAUVE le média en attente,
// donc il part même avec une liste vide. fetch_json résout false en cas d'échec (et alerte déjà
// l'utilisateur sur les erreurs HTTP) ; true = requête aboutie.
export const envoieSuppressions = createAsyncThunk('mediasComp/envoieSuppressions', async (_, {getState}) => {
    const etat = getState().mediasComp
    const res = await fetch_json({liste: etat.listeSupp, mediaBase: etat.mediaASupp, typeMedia: etat.typeMedia, tags: etat.tagsHerites}, 'DELETE', 'media/upload')
    return res !== false
})

export const mediasCompSlice = createSlice({
    name: 'imagesComp',
    initialState: {listeVerif: [], listeSelec: [], etat: 'idle', listeSupp: [], mediaASupp: false, indexMediaActuel: 0, tailleMediaActuelle: {width: 0, height: 0}, typeMedia: null, nomMediaActuel: null, tagsHerites: [], suppPrete: false},
    reducers: {
        ajoute: (state, action) => {
            state.listeVerif = [...state.listeVerif, ...action.payload.liste]
            state.listeSupp = []
            state.mediaASupp = false
            state.tailleMediaActuelle = action.payload.taille
            state.etat = 'waitingUser'
            if (action.payload.nouveauNom !== undefined) state.nomMediaActuel = action.payload.nouveauNom
            else state.nomMediaActuel = state.listeSelec[state.indexMediaActuel].name
        },
        retire: (state, action) => {
            if (action.payload !== undefined) state.tagsHerites = action.payload
            state.listeSupp = [...state.listeSupp, state.listeVerif[0].id]
            state.listeVerif = state.listeVerif.filter((elt) => elt.id !== state.listeVerif[0].id)
            if (state.listeVerif.length === 0) state.suppPrete = true
        },
        termine: (state) => {
            state.mediaASupp = true
            state.listeVerif = []
            state.suppPrete = true
        },
        avance: (state) => {
            state.listeVerif = state.listeVerif.filter((elt) => elt !== state.listeVerif[0])
            if (state.listeVerif.length === 0) state.suppPrete = true
        },
        changeEtat: (state, action) => {
            if (state.etat === 'idle') {
                state.etat = 'working'
                state.listeSelec = action.payload.fichiers
                state.indexMediaActuel = 0
                state.typeMedia = action.payload.type
            }
            else if (state.etat === 'working') state.etat = 'waitingServer'
            else if (state.etat === 'waitingServer') state.etat = 'ended'
            else if (state.etat === 'ended') {
                if (state.indexMediaActuel < state.listeSelec.length-1) {
                    state.etat = 'working'
                    state.indexMediaActuel = state.indexMediaActuel + 1
                }
                else {
                    state.etat = 'idle'
                }
            }
        },
        desarme: (state) => {
            //vide la sélection résiduelle une fois les uploads terminés — la machine ne rejoue pas la branche idle au remontage du composant
            if (state.etat === 'idle') state.listeSelec = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(envoieSuppressions.fulfilled, (state, action) => {
            state.suppPrete = false
            state.etat = 'ended'   //même en cas d'échec (action.payload false) : retireDouble consomme le média
            //en attente DÈS le début de la requête, un retry tomberait sur « aucun média en attente » ;
            //l'utilisateur a été alerté par fetch_json, la machine ne doit pas se suspendre.
        })
    }
})

export const {ajoute, retire, termine, avance, changeEtat, desarme} = mediasCompSlice.actions

export default mediasCompSlice.reducer