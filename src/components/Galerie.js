import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_json } from '../modules/com'
import { changeLoading } from '../store/slices/displaySlice'

import Filtres from './galerie/Filtres'
import VueMedia from './galerie/VueMedia'
import ZoneAjout from './galerie/ZoneAjout'
import Miniatures from './galerie/Miniatures'

import '../styles/galerie.css'
import { NB_IMAGE_PAR_PAGE } from "../data/config"
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
    const [sourceSelec, setSourceSelec] = useState('toutes')
    const [tagsSelec, setTagsSelec] = useState(listeCategoriesTags.map(elt => {
        return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
    }))
    const [scroll, setScroll] = useState(0)
    const listeSource = useSelector((state) => state.sources.listeNomAlphab)

    async function chargeListe() {
        let filtre = []
        tagsSelec.forEach((element, indexElt) => {
            element.liste.forEach((tag, indexTag) => {
                if (tag) filtre.push(listeCategoriesTags[indexElt].liste[indexTag])
            })
        });
        const rep = await fetch_json({filtre: filtreSelec, sourceSelec: sourceSelec, tagsFiltres: filtre, typeFiltres: {image: triTypeImage, album: triTypeAlbum, video: triTypeVideo}, favoriFiltre: triFavori, nbImages: NB_IMAGE_PAR_PAGE, page: page, tri: triSelec}, 'post', 'media')
        if (rep) {
            if (rep.max % NB_IMAGE_PAR_PAGE === 0)
                setMaxPage(Math.floor(rep.max / NB_IMAGE_PAR_PAGE)-1)
            else
                setMaxPage(Math.floor(rep.max / NB_IMAGE_PAR_PAGE))
            return rep.res
        }
        else return null
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
            if (nouvListe !== null) {
                setListe(nouvListe)
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
                if (nouvListe !== null) {
                    setListe(nouvListe)
                }
                dispatch(changeLoading())
            })
        }
        else
            setPage(0)
    }, [filtreSelec, triFavori, triTypeAlbum, triTypeImage, triTypeVideo, triSelec, tagsSelec, sourceSelec])

    if (mediaSelec === null) {
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
                    categorieSelec={categorieSelec} sourceSelec={sourceSelec} setSourceSelec={setSourceSelec} listeSources={listeSource} 
                    setCategorieSelec={setCategorieSelec} listeCategoriesTags={listeCategoriesTags} />

                <Miniatures liste={liste} onSelectMedia={(index) => {
                    setScroll(window.scrollY)
                    setMediaSelec(index)
                }} />
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