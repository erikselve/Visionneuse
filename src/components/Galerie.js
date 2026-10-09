import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_json } from '../modules/com'
import { changeLoading } from '../store/slices/displaySlice'

import Filtres from './galerie/Filtres'
import VueMedia from './galerie/VueMedia'
import ZoneAjout from './galerie/ZoneAjout'

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
    const [scroll, setScroll] = useState(0)
    const listeSource = useSelector((state) => state.sources.listeNomAlphab)

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
                <ZoneAjout affiche={affAjoutData} setAffiche={setAffAjoutData} chargeListe={chargeListe} setListe={setListe} />

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