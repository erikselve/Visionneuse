import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetch_form, fetch_json } from '../../modules/com'
import { changeTache, agir } from '../../store/slices/indiceProgressionSlice'
import { ajoute, changeEtat, desarme, envoieSuppressions } from '../../store/slices/mediasCompSlice'
import { changeBarreProgression, changePrinc, changeLoading } from '../../store/slices/displaySlice'
import '../../styles/panneaux.css'
import '../../styles/zoneAjout.css'

function ZoneAjout(props) {
    const dispatch = useDispatch()
    const derniereSource = useSelector((state) => state.sources.derniereSourceUtilisee)
    //uploads de nouveaux médias
    const etat = useSelector((state) => state.mediasComp.etat)
    const listeSelec = useSelector((state) => state.mediasComp.listeSelec)
    const indexMediaEnCours = useSelector((state) => state.mediasComp.indexMediaActuel)
    const type = useSelector((state) => state.mediasComp.typeMedia)
    const suppPrete = useSelector((state) => state.mediasComp.suppPrete)
    const displayPrinc = useSelector((state) => state.display.princ)
    const [site8musesEnsemble, setsite8musesEnsemble] = useState(false)
    const [assocSource, setAssocSource] = useState(true)

    //gère l'uploads de nouveaux médias
    useEffect(() => {
        if ((listeSelec.length > indexMediaEnCours) && (etat === 'working')) {
            let formData = new FormData()
            if (assocSource && derniereSource !== null)
                formData.append('source', derniereSource.nom)
            dispatch(changeEtat())
            if (type === 'album') {
                const info = listeSelec[indexMediaEnCours][0].webkitRelativePath.split('/')
                formData.append('nom', info[0])
                let tome = (info.length>2)?info[1]:null
                let nbPage = 0
                for (let index = 0; index < listeSelec[indexMediaEnCours].length; index++) {
                    const fichier = listeSelec[indexMediaEnCours][index];
                    formData.append(type, fichier)
                    if (tome !== null) {
                        const tomeActuel = fichier.webkitRelativePath.split('/')[1]
                        if (tomeActuel !== tome) {
                            tome = tomeActuel
                            formData.append('tome', nbPage)
                            nbPage = 0
                        }
                    }
                    nbPage++
                }
                formData.append('tome', nbPage)
            }
            else {
                formData.append(type, listeSelec[indexMediaEnCours])
            }
            fetch_form(formData, type+'/upload').then(res => {
                if (res) {
                    if (res.listeVerif === undefined) {
                        dispatch(changeEtat())
                    }
                    else {
                        dispatch(changeLoading())
                        dispatch(changePrinc({panneau: 'comparateur'}))
                        if (res.nouveauNom !== undefined) dispatch(ajoute({liste: res.listeVerif, taille: res.taille, nouveauNom: res.nouveauNom,
                            source: (assocSource && derniereSource !== null)?derniereSource.nom:null}))
                        else dispatch(ajoute({liste: res.listeVerif, taille: res.taille,
                            source: (assocSource && derniereSource !== null)?derniereSource.nom:null}))
                    }
                }
                else dispatch(changeEtat())
            })
        }
        else if (etat === 'ended') {
            dispatch(agir())
            if (displayPrinc.comparateur) {
                dispatch(changeLoading())
                dispatch(changePrinc({panneau: 'gallerie'}))
            }
            dispatch(changeEtat())
        }
        else if (etat === 'idle' && listeSelec.length > 0) {
            console.log('uploads terminés')
            dispatch(changeBarreProgression())
            props.chargeListe().then(nouvListe => {
                if (nouvListe !== null) {
                    props.setListe(nouvListe)
                }
                dispatch(changeLoading())
                dispatch(desarme())
            })
        }
    }, [etat])

    //c'est de moment du supprimer les fichiers
    useEffect(() => {
        if (suppPrete) dispatch(envoieSuppressions())
    }, [suppPrete])

    if (!props.affiche) return null

    return (
        <div className='panneauCarte panneauFixe'>
            <div className='entetePanneau'>
                <span className='titrePanneau'>Ajouts de nouveaux médias</span>
                <input type='button' value='✕ cacher' onClick={() => props.setAffiche(false)} />
            </div>
            <div className='groupes'>
                {(derniereSource !== null)?<div className='groupe'>
                    <span className='titreGroupe'>Associer à une source</span>
                    <div>
                        <input type='checkbox' checked={assocSource} onClick={() => setAssocSource(!assocSource)} />
                        <label>Associer ces médias à la source « {derniereSource.nom} »</label>
                    </div>
                </div>:null}
            </div>
            <div className='groupes'> {/*styles 'groupes colonnes' si on souhaite organiser les groupes en colonne */}
                <div className='groupe'>
                    <span className='titreGroupe'>Fichiers locaux</span>
                    <div className='ajoutImages'>
                        <label className='boutonFichier'>Uploader des images…<input type='file' accept='image/*' multiple hidden onChange={async (e) => {
                            const fichiersSelec = e.target.files
                            dispatch(changeTache({nom: 'Traitement des images sélectionnées', objectif: fichiersSelec.length}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            dispatch(changeEtat({fichiers: fichiersSelec, type: 'image'}))
                        }} /></label>
                    </div>
                    <div className='ajoutVideos'>
                        <label className='boutonFichier'>Uploader des vidéos…<input type='file' accept='video/*' multiple hidden onChange={async (e) => {
                            const fichiersSelec = e.target.files
                            dispatch(changeTache({nom: 'Traitement des vidéos sélectionnées', objectif: fichiersSelec.length}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            dispatch(changeEtat({fichiers: fichiersSelec, type: 'video'}))
                        }} /></label>
                    </div>
                    <div className='ajoutAlbums'>
                        <label className='boutonFichier'>Uploader un album…<input type='file' webkitdirectory='' multiple hidden onChange={async (e) => {
                            const fichiersSelec = e.target.files
                            dispatch(changeTache({nom: 'Traitement de l\'album sélectionné', objectif: 1}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            let format = []
                            format[0] = fichiersSelec
                            dispatch(changeEtat({fichiers: format, type: 'album'}))
                        }} /></label>
                    </div>
                    <p>
                        <span>Récupération d'une vidéo trop grosse (attention! pas de test d'unicité)</span><br/>
                        <label>titre de la vidéo dans le répertoire temp du serveur: </label><input type='text' id='titreVideo' />
                        <input type='button' value='Lancement' onClick={() => {
                            const titre = document.getElementById('titreVideo').value
                            dispatch(changeLoading())
                            fetch_json({titre: titre}, 'PUT', 'video/upload/local').then(res => {
                                document.getElementById('titreVideo').value = ''
                                dispatch(changeLoading())
                            })
                        }} />
                    </p>
                </div>
                <div className='groupe'>
                    <span className='titreGroupe'>Récupération web</span>
                    <p>
                        <span>Récupération d'un album sur Erofus.com</span><br/>
                        <span>auteur/titre de l'album :</span><input type='text' id='info' />
                        <input type='button' value='Lancement' onClick={() => {
                            const infos = document.getElementById('info').value
                            fetch_json({info: infos}, 'PUT', 'album/parseWeb/erofus').then(res => {
                                if (res) {
                                    document.getElementById('info').value = ''
                                }
                                else console.log('Erreur pour récupérer l\'album')
                            })
                        }} />
                    </p>

                    <p>
                        <span>Récupération d'un album sur comics.8muses.com</span><br/>
                        <label>auteur/titre de l'album: </label><input type='text' id='info8muses' />
                        <input type='checkbox' checked={site8musesEnsemble} onClick={() => {
                            setsite8musesEnsemble(!site8musesEnsemble)
                        }} /><label>ensemble d'albums</label>
                        <input type='button' value='Lancement' onClick={() => {
                            const infos = document.getElementById('info8muses').value
                            dispatch(changeLoading())
                            fetch_json({info: infos, ensemble: site8musesEnsemble}, 'PUT', 'parseweb/8muses').then(res => {
                                if (res) {
                                    document.getElementById('info8muses').value = ''
                                    if (res.listeVerif !== undefined) {
                                        //A FAIRE
                                    }
                                    dispatch(changeLoading())
                                }
                                else {
                                    console.log('Erreur pour récupérer l\'album');
                                    dispatch(changeLoading())
                                }
                            })
                        }} />
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ZoneAjout