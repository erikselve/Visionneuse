import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_get, fetch_form, fetch_json } from '../modules/com'
import { changeTache, agir, augmenteObjectif } from '../store/slices/indiceProgressionSlice'
import { ajoute, changeEtat} from '../store/slices/mediasCompSlice'
import { selectionneMedia, annuleSelection, changeBarreProgression, changePrinc, changeLoading } from '../store/slices/displaySlice'
import { changeDerniereSource } from '../store/slices/sourceSlice'

import Filtres from './galerie/Filtres'
import VueMedia from './galerie/VueMedia'

import Image from './Image'
import Album from './Album'
import Video from './Video'
import '../styles/galerie.css'
import { NB_IMAGE_PAR_PAGE, NB_COLONNE_GALLERIE } from "../data/config"
import iconeDebut from '../assets/debut.png'
import iconeFin from '../assets/fin.png'
import iconeAvance from '../assets/avance.png'
import iconeRecule from '../assets/recule.png'

function Galerie(props) {
    const dispatch = useDispatch()
    const [page, setPage] = useState(0)
    const [liste, setListe] = useState([])
    const [maxPage, setMaxPage] = useState(0)
    const [affFiltre, setaffFiltre] = useState(false)
    const [affAjoutData, setAffAjoutData] = useState(false)
    const [mediaSelec, setMediaSelec] = useState(null)
    const [futurMediaSelec, setfuturMediaSelec] = useState(null)
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const [filtreSelec, setfiltreSelec] = useState('sans')
    const [triSelec, setTriSelec] = useState('name')
    const [triTypeVideo, setTriTypeVideo] = useState(true)
    const [triTypeImage, setTriTypeImage] = useState(true)
    const [triTypeAlbum, setTriTypeAlbum] = useState(true)
    const [triFavori, setTriFavori] = useState(false)
    const [tagsSelec, setTagsSelec] = useState(listeCategoriesTags.map(elt => {
        return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
    }))
    const displayPrinc = useSelector((state) => state.display.princ)
    const [scroll, setScroll] = useState(0)
    const listeSource = useSelector((state) => state.sources.listeNomAlphab)
    const derniereSource = useSelector((state) => state.sources.derniereSourceUtilisee)
    //uploads de nouveaux médias
    const etat = useSelector((state) => state.mediasComp.etat)
    const listeSelec = useSelector((state) => state.mediasComp.listeSelec)
    const indexMediaEnCours = useSelector((state) => state.mediasComp.indexMediaActuel)
    const type = useSelector((state) => state.mediasComp.typeMedia)
    const [site8musesEnsemble, setsite8musesEnsemble] = useState(false)
    const [assocSource, setAssocSource] = useState(true)

    function colonnePlusPetite(tailleColonnes) {
        let res = 0
        for (let index = 1; index < tailleColonnes.length; index++) {
            if (tailleColonnes[index] < tailleColonnes[res]) res = index            
        }
        return res
    }

    async function chargeListe() {
        let filtre = []
        tagsSelec.forEach((element, indexElt) => {
            element.liste.forEach((tag, indexTag) => {
                if (tag) filtre.push(listeCategoriesTags[indexElt].liste[indexTag])
            })
        });
        const rep = await fetch_json({filtre: filtreSelec, tagsFiltres: filtre, typeFiltres: {image: triTypeImage, album: triTypeAlbum, video: triTypeVideo}, favoriFiltre: triFavori, nbImages: NB_IMAGE_PAR_PAGE, page: page, tri: triSelec}, 'post', 'media')
        if (rep) {
            if (rep.max % NB_IMAGE_PAR_PAGE === 0)
                setMaxPage(Math.floor(rep.max / NB_IMAGE_PAR_PAGE)-1)
            else
                setMaxPage(Math.floor(rep.max / NB_IMAGE_PAR_PAGE))
            return rep.res
        }
        else return []
    }

    function determineMedia(media, display) {
        switch (media.type) {
            case 'image':
                return(<Image nom={media.name} display={display} />)
                break;
            case 'album':
                return(<Album nom={media.name} display={display} />)
                break;
            case 'video':
                return(<Video nom={media.name} display={display} />)
                break;
            default:
                console.log('type de média inconnu pour afficher '+media.name);
                return null
                break;
        }
    }

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
                        if (res.nouveauNom !== undefined) dispatch(ajoute({liste: res.listeVerif, taille: res.taille, nouveauNom: res.nouveauNom}))
                        else dispatch(ajoute({liste: res.listeVerif, taille: res.taille}))
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
            chargeListe().then(nouvListe => {
                if (nouvListe.length > 0) {
                    setListe(nouvListe)
                }
            })
            dispatch(changeLoading())
        }
    }, [etat])

    useEffect(() => {
        if (mediaSelec === null && scroll > 0) {
            window.scroll(0, scroll)
            setScroll(0)
        }
        else if (mediaSelec !== null)
            window.scroll(0, 0)
    })

    //met à jour la liste des médias de la gallerie
    useEffect(() => {
        dispatch(changeLoading())
        chargeListe().then(nouvListe => {
            if (nouvListe.length > 0) {
                const result = nouvListe.map(((elt, index) => {
                    if (index > 0) elt.prec = index-1
                    if (index < nouvListe.length-1) elt.suiv = index+1
                    return elt
                }))
                setListe(result)
            }
            if (futurMediaSelec !== null) {
                setMediaSelec(futurMediaSelec)
                setfuturMediaSelec(null)
            }
            dispatch(changeLoading())
        })
    }, [page])

//définition du filtre d'affichage de la gallerie
    useEffect(() => {
        if (page === 0) {
            dispatch(changeLoading())
            chargeListe().then(nouvListe => {
                if (nouvListe.length > 0) {
                    const result = nouvListe.map(((elt, index) => {
                        if (index > 0) elt.prec = index-1
                        if (index < nouvListe.length-1) elt.suiv = index+1
                        return elt
                    }))
                    setListe(result)
                }
                dispatch(changeLoading())
            })
        }
        else
            setPage(0)
    }, [filtreSelec, triFavori, triTypeAlbum, triTypeImage, triTypeVideo, triSelec, tagsSelec])

    if (mediaSelec === null) {
//on affiche la gallerie de miniatures de média
//construction des colonnes de médias
        let tailleColonnes = []
        let colonnes = []
        for (let index = 0; index < NB_COLONNE_GALLERIE; index++) {
            tailleColonnes.push(0)
            colonnes.push([])
        }
        liste.map((media, index) => {
            const colonne = colonnePlusPetite(tailleColonnes)
            const rapportTaille = media.taille.height / media.taille.width
            tailleColonnes[colonne] = tailleColonnes[colonne] + rapportTaille
            colonnes[colonne].push(<div className='media' key={media.name} onClick={() => {
                setScroll(window.scrollY)
                setMediaSelec(index)
            }}>{determineMedia(media, 'mini')}</div>)
        })
        const largeurColonne = Math.floor(100/NB_COLONNE_GALLERIE - 1)+'%'
//affichage de la gallerie (menus + colonnes de médias)
        return(
            <div className='conteneur'>
                <div className='gestionPage'>
                    <div>
                        {(!affAjoutData)?<input type='button' value='ajouter des médias' onClick={() => {
                            setAffAjoutData(true)
                        }} />:null}
                    </div>
                    <div className='filtre'>
                        {(!affFiltre)?<input type='button' value='définir les filtres' onClick={() => {
                            setaffFiltre(true)
                        }} />:null}
                    </div>
                    <div className='zoneBouton'>
                        {(page > 0)?<img src={iconeDebut} className='icone clicable inv' onClick={() => {
                            setPage(0)
                        }} />:<img src={iconeDebut} className='icone'/>}
                        {(page > 0)?<img src={iconeRecule} className='icone clicable inv' onClick={() => {
                            setPage(page-1)
                        }} />:<img src={iconeRecule} className='icone inv'/>}
                    </div>
                    <span>
                        {(page > 0)?<span><span className='clicable' onClick={() => {setPage(0)}}>1</span> ... </span>:null}
                        {((page+1)/2 > 5)?<span><span className='clicable' onClick={() => {setPage(Math.round((page+1)/2)-1)}}>{Math.round((page+1)/2)}</span> ... </span>:null}
                        {page+1}
                        {((maxPage-page)/2 > 5)?<span> ... <span className='clicable' onClick={() => {setPage(maxPage - Math.round((maxPage-page)/2)-1)}}>{maxPage - Math.round((maxPage-page)/2)}</span></span>:null}
                        {(page < maxPage)?<span> ... <span className='clicable' onClick={() => setPage(maxPage)}>{maxPage+1}</span></span>:null}
                    </span>
                    <div className='zoneBouton'>
                        {(page < maxPage)?<img src={iconeAvance} className='icone clicable inv' onClick={() => {
                            setPage(page+1)
                        }} />:<img src={iconeAvance} className='icone'/>}
                        {(page < maxPage)?<img src={iconeFin} className='icone clicable inv' onClick={() => {
                            setPage(maxPage)
                        }} />:<img src={iconeFin} className='icone'/>}
                    </div>
                </div>

                {/*zone de saisie pour ajouter de nouveaux médias */}
                {(affAjoutData)?<div>
                    {(derniereSource !== null)?<div>
                        <input type='checkbox' checked={assocSource} onClick={() => setAssocSource(!assocSource)} />
                        <label>Associer ces médias à la source « {derniereSource.nom} »</label>
                    </div>:null}
                    <div className='ajoutImages'>
                        <label>Sélectionner des images à ajouter:</label>
                        <input type='file' accept='image/*' id='selecFichiers' multiple onChange={async () => {
                            const fichiersSelec = document.getElementById('selecFichiers').files
                            dispatch(changeTache({nom: 'Traitement des images sélectionnées', objectif: fichiersSelec.length}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            dispatch(changeEtat({fichiers: fichiersSelec, type: 'image'}))
                        }} />
                    </div>
                    <div className='ajoutVideos'>
                        <label>Sélectionner des videos à ajouter:</label>
                        <input type='file' accept='video/*' id='selecVideos' onChange={async () => {
                            const fichiersSelec = document.getElementById('selecVideos').files
                            dispatch(changeTache({nom: 'Traitement des vidéos sélectionnées', objectif: fichiersSelec.length}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            dispatch(changeEtat({fichiers: fichiersSelec, type: 'video'}))
                        }} />
                    </div>
                    <div className='ajoutAlbums'>
                        <label>Sélectionner un album à ajouter:</label>
                        <input type='file' id='selecAlbum' webkitdirectory='' onChange={() => {
                            const fichiersSelec = document.getElementById('selecAlbum').files
                            dispatch(changeTache({nom: 'Traitement de l\'album sélectionné', objectif: 1}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            let format = []
                            format[0] = fichiersSelec
                            dispatch(changeEtat({fichiers: format, type: 'album'}))
                        }} />
                    </div>
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
                                    // dispatch(chargeListe())
                                    dispatch(changeLoading())
                                }
                                else {
                                    console.log('Erreur pour récupérer l\'album');
                                    dispatch(changeLoading())
                                }
                            })
                        }} />
                    </p>

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
                    <input type='button' value='cacher' onClick={() => {
                        setAffAjoutData(false)
                    }} />
                </div>:null}

                {/*zone de sélection des filtres d'affichage des médias */}
                <Filtres affiche={affFiltre} setAffiche={setaffFiltre} filtreSelec={filtreSelec} setfiltreSelec={setfiltreSelec}
                    triSelec={triSelec} setTriSelec={setTriSelec} triTypeVideo={triTypeVideo} setTriTypeVideo={setTriTypeVideo}
                    triTypeImage={triTypeImage} setTriTypeImage={setTriTypeImage} triTypeAlbum={triTypeAlbum} setTriTypeAlbum={setTriTypeAlbum}
                    triFavori={triFavori} setTriFavori={setTriFavori} tagsSelec={tagsSelec} setTagsSelec={setTagsSelec}
                    categorieSelec={categorieSelec} setCategorieSelec={setCategorieSelec}
                    listeCategoriesTags={listeCategoriesTags} />

                {(colonnes[0].length > 0)?colonnes.map((elt, index) => {
                    return (<div className='column' id={'col'+index} style={{width: largeurColonne}} key={'col'+index}>
                        {elt}
                    </div>)
                }):<span>Aucun média dans la liste</span>}
            </div>
        )
    }
    else {
        return (<VueMedia liste={liste} mediaSelec={mediaSelec} setMediaSelec={setMediaSelec} page={page} maxPage={maxPage}
            setPage={setPage} setfuturMediaSelec={setfuturMediaSelec} setListe={setListe} chargeListe={chargeListe}
            listeSource={listeSource} NB_IMAGE_PAR_PAGE={NB_IMAGE_PAR_PAGE} />)
    }
}

export default Galerie