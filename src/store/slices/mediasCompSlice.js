import { createSlice } from '@reduxjs/toolkit'
import { fetch_json } from '../../modules/com'

async function envoiSupp(data) {
    let res = fetch_json(data, 'DELETE', 'media/upload')
    if (res.ok) {
        console.log(res.message);
        return true
    }
    else {
        console.log(res.message);
        return false
    }
}

export const mediasCompSlice = createSlice({
    name: 'imagesComp',
    initialState: {listeVerif: [], listeSelec: [], etat: 'idle', listeSupp: [], mediaASupp: false, indexMediaActuel: 0, tailleMediaActuelle: {width: 0, height: 0}, typeMedia: null, nomMediaActuel: null, tagsHerites: []},
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
            state.listeSupp = [...state.listeSupp, state.listeVerif[0].nom]
            state.listeVerif = state.listeVerif.filter((elt) => elt.nom !== state.listeVerif[0].nom)
            if (state.listeVerif.length === 0) if (envoiSupp({liste: state.listeSupp, mediaBase: state.mediaASupp, typeMedia: state.typeMedia, tags: state.tagsHerites})) state.etat = 'ended'

        },
        termine: (state) => {
            state.mediaASupp = true
            state.listeVerif = []
            if (envoiSupp({liste: state.listeSupp, mediaBase: state.mediaASupp})) state.etat = 'ended'
        },
        avance: (state) => {
            state.listeVerif = state.listeVerif.filter((elt) => elt !== state.listeVerif[0])
            if (state.listeVerif.length === 0) if (envoiSupp({liste: state.listeSupp, mediaBase: state.mediaASupp, typeMedia: state.typeMedia, tags: state.tagsHerites})) state.etat = 'ended'
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
    }
})

export const {ajoute, retire, termine, avance, changeEtat, desarme} = mediasCompSlice.actions

export default mediasCompSlice.reducer