import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_get, fetch_form, fetch_json } from '../modules/com'
import { changeTache, agir, augmenteObjectif } from '../store/slices/indiceProgressionSlice'
import { ajoute, changeEtat } from '../store/slices/imagesCompSlice'
import { selectionneMedia, annuleSelection, changeBarreProgression, changePrinc, changeLoading } from '../store/slices/displaySlice'
import Image from './Image'
import Album from './Album'
import '../styles/gallerie.css'
import { NB_IMAGE_PAR_PAGE, NB_COLONNE_GALLERIE } from "../data/config"
import iconeDebut from '../assets/debut.png'
import iconeFin from '../assets/fin.png'
import iconeAvance from '../assets/avance.png'
import iconeRecule from '../assets/recule.png'

function Gallerie() {
    const dispatch = useDispatch()
    //gallerie
    const [page, setPage] = useState(0)
    const [liste, setListe] = useState([])
    const [maxPage, setMaxPage] = useState(0)
    const [affFiltre, setaffFiltre] = useState(false)
    const mediaSelec = useSelector((state) => state.display.mediaSelec)
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const [filtreSelec, setfiltreSelec] = useState('sans')
    const [tagsSelec, setTagsSelec] = useState(listeCategoriesTags.map(elt => {
        return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
    }))
    const displayPrinc = useSelector((state) => state.display.princ)
    //uploads des nouvelles images
    const etat = useSelector((state) => state.imagesComp.etat)
    const listeSelec = useSelector((state) => state.imagesComp.listeSelec)
    const indexImEnCours = useSelector((state) => state.imagesComp.indexImActuelle)

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
        const rep = await fetch_json({filtre: filtreSelec, tagsFiltres: filtre, nbImages: NB_IMAGE_PAR_PAGE, page: page}, 'post', 'medias')
        if (rep) return rep.res
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
            default:
                console.log('type de média inconnu pour afficher '+media.name);
                return null
                break;
        }
    }

    useEffect(() => {
        if ((listeSelec.length > indexImEnCours) && (etat === 'working')) {
            dispatch(changeEtat())
            const formData = new FormData()
            formData.append('image', listeSelec[indexImEnCours])
            fetch_form(formData, 'upload/images').then(res => {
                if (res) {
                    if (res.listeVerif === undefined) {
                        dispatch(changeEtat())              
                    }
                    else {
                        dispatch(changeLoading())
                        dispatch(changePrinc({panneau: 'comparateur'}))
                        dispatch(ajoute({liste: res.listeVerif, taille: res.taille}))
                    }
                }  
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
            console.log('uploads terminés');
            dispatch(changeBarreProgression())
            dispatch(changeLoading())
            chargeListe().then(nouvListe => {
                if (nouvListe.length > 0) {
                    setListe(nouvListe)
                }
            })
        }
    }, [etat])

    useEffect(() => {
        setMaxPage(Math.floor((liste.length-1) / NB_IMAGE_PAR_PAGE))
    }, [liste])

    useEffect(() => {
        dispatch(changeLoading())
        chargeListe().then(nouvListe => {
            if (nouvListe.length > 0) {
                const result = nouvListe.map(((elt, index) => {
                    if (index > 0) elt.prec = nouvListe[index-1].name
                    if (index < nouvListe.length-1) elt.suiv = nouvListe[index+1].name
                    return elt
                }))
                setPage(0)
                setListe(result)
            }
            dispatch(changeLoading())
        })
    }, [filtreSelec])


    if (mediaSelec === null) {
        let tailleColonnes = []
        let colonnes = []
        for (let index = 0; index < NB_COLONNE_GALLERIE; index++) {
            tailleColonnes.push(0)
            colonnes.push([])
        }
        liste.filter((elt, index) => index>=NB_IMAGE_PAR_PAGE*page && index<NB_IMAGE_PAR_PAGE*page+NB_IMAGE_PAR_PAGE).map((media, index) => {
            const colonne = colonnePlusPetite(tailleColonnes)
            const rapportTaille = media.taille.height / media.taille.width
            tailleColonnes[colonne] = tailleColonnes[colonne] + rapportTaille
            colonnes[colonne].push(<div className='media' key={media.name} onClick={() => {
                dispatch(selectionneMedia(media.name))
            }}>{determineMedia(media, 'mini')}</div>)
        })
        const largeurColonne = Math.floor(100/NB_COLONNE_GALLERIE - 1)+'%'
        return(
            <div className='conteneur'>
                <div className='gestionPage'>
                    <div className='ajoutImages'>
                        <label>Sélectionner des images à ajouter:</label>
                        <input type='file' accept='image/*' id='selecFichiers' multiple onChange={async () => {
                            const fichiersSelec = document.getElementById('selecFichiers').files
                            dispatch(changeTache({nom: 'Traitement des images sélectionnées', objectif: fichiersSelec.length}))
                            dispatch(changeBarreProgression())
                            dispatch(changeLoading())
                            dispatch(changeEtat(fichiersSelec))
                        }} />
                    </div>
                    <div className='ajoutAlbums'>
                        <input type='button' value='Parser le répertoire des albums' onClick={() => {
                            dispatch(changeLoading())
                            fetch_json({}, 'post', 'upload/albums').then(rep => {
                                // if (rep) setListe(rep.res)
                                dispatch(changeLoading())
                            })
                        }} />
                    </div>
                    <div className='filtre'>
                        {(!affFiltre)?<input type='button' value='définir les filtres' onClick={() => {
                            setaffFiltre(true)
                        }} />:null}
                    </div>
                    <div className='zoneBouton'>
                        {(page > 0)?<img src={iconeDebut} className='icone clicable' onClick={() => {
                            setPage(0)
                        }} />:<img src={iconeDebut} className='icone'/>}
                        {(page > 0)?<img src={iconeRecule} className='icone clicable' onClick={() => {
                            setPage(page-1)
                        }} />:<img src={iconeRecule} className='icone'/>}
                    </div>
                    <span> {page+1}/{maxPage+1} </span>
                    <div className='zoneBouton'>
                        {(page < maxPage)?<img src={iconeAvance} className='icone clicable' onClick={() => {
                            setPage(page+1)
                        }} />:<img src={iconeAvance} className='icone'/>}
                        {(page < maxPage)?<img src={iconeFin} className='icone clicable' onClick={() => {
                            setPage(maxPage)
                        }} />:<img src={iconeFin} className='icone'/>}
                    </div>
                </div>
                {(affFiltre)?<div className='zoneFiltre'>
                    <div className='menu'>
                        <input type='button' value='images avec tags' onClick={() => {
                            setfiltreSelec('avecTag')
                        }} />
                        <input type='button' value='images sans tags' onClick={() => {
                            setfiltreSelec('sansTag')
                        }} />
                        <input type='button' value='toutes les images' onClick={() => {
                            setfiltreSelec('sans')
                        }} />
                        <input type='button' value='filtrer' onClick={() => {
                            setfiltreSelec('filtre')
                        }} />
                        <input type='button' value='réinitialiser les filtres' onClick={() => {
                            setTagsSelec(listeCategoriesTags.map(elt => {
                                return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
                            }))
                        }} /><br/>
                        {listeCategoriesTags.map((elt, index) => <span className={(categorieSelec === index)?'clicable selec':'menu clicable'} key={elt.categorie} onClick={() => {
                            setCategorieSelec(index)
                            // setTagSelec(null)
                        }}>{elt.categorie}</span>)}
                    </div>
                    <div className='listeTags'>
                        {listeCategoriesTags[categorieSelec].liste.map((elt, index) => <div className='case' key={elt}><label className={(tagsSelec[categorieSelec].liste[index])?'tag clicable selec':'tag clicable'} onClick={() => {
                            let res = [...tagsSelec]
                            res[categorieSelec].liste[index] = !res[categorieSelec].liste[index]
                            setTagsSelec(res)
                        }}>{elt}</label></div>)}
                    </div>
                    <input type='button' value='cacher' onClick={() => {
                        setaffFiltre(false)
                    }} />
                </div>: null}
                
                {colonnes.map((elt, index) => {
                    return (<div className='column' id={'col'+index} style={{width: largeurColonne}} key={'col'+index}>
                        {elt}
                    </div>)
                })}
            </div>
        )
    }
    else {
        const media = liste.find(elt => elt.name === mediaSelec)
        switch (media.type) {
            case 'image':
                return(<Image display='complet' nom={mediaSelec} prec={media.prec} suiv={media.suiv} />)                
                break;
            case 'album':
                return(<Album display='complet' nom={mediaSelec} prec={media.prec} suiv={media.suiv} />)
                break;
            default:
                console.log('type de média inconnu à afficher '+mediaSelec);
                return null
                break;
        }
    }
}

export default Gallerie