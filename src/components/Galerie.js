import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { fetch_json } from '../modules/com'
import { changeLoading } from '../store/slices/displaySlice'

import Filtres from './galerie/Filtres'
import VueMedia from './galerie/VueMedia'
import ZoneAjout from './galerie/ZoneAjout'
import Miniatures from './galerie/Miniatures'

import '../styles/galerie.css'
import { NB_IMAGE_PAR_PAGE } from "../data/config"

function Galerie(props) {
    const dispatch = useDispatch()
    const premiereCharge = useRef(true)   //le montage est déjà couvert par l'effet des filtres
    const [page, setPage] = useState(0)
    const [liste, setListe] = useState([])
    const [maxPage, setMaxPage] = useState(0)
    const enCours = useRef(false)   //garde : une seule charge de page à la fois
    const sentinelRef = useRef(null)
    const version = useRef(0)   //invalide les réponses d'append parties avec d'anciens filtres
    const [chargementPage, setChargementPage] = useState(false)   //append en cours : trois points en bas de galerie
    const [affFiltre, setaffFiltre] = useState(false)
    const [affAjoutData, setAffAjoutData] = useState(false)
    const [mediaSelec, setMediaSelec] = useState(null)
    const [futurMediaSelec, setfuturMediaSelec] = useState(null)
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const [filtreSelec, setfiltreSelec] = useState('sans')
    const [triSelec, setTriSelec] = useState('aleatoire')
    const [triTypeVideo, setTriTypeVideo] = useState(true)
    const [triTypeImage, setTriTypeImage] = useState(true)
    const [triTypeAlbum, setTriTypeAlbum] = useState(true)
    const [triFavori, setTriFavori] = useState(false)
    const [sourceSelec, setSourceSelec] = useState('toutes')
    const [tagsSelec, setTagsSelec] = useState(listeCategoriesTags.map(elt => {
        return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
    }))
    const [dernierVu, setDernierVu] = useState(null)   //index du dernier média visité en vue média
    const listeSource = useSelector((state) => state.sources.listeNomAlphab)
    const [graine, setGraine] = useState('')

    //chargePage = requête d'une page précise (append du scroll infini) ;
    //sans argument = recharge de TOUT le préfixe affiché (pages 0..page en une requête) après
    //suppression ou fin d'uploads : les index de l'accumulé doivent être renumérotés en place.
    async function chargeListe(chargePage = null, graineForcee = null) {
        let filtre = []
        tagsSelec.forEach((element, indexElt) => {          // construction du filtre : inchangée
            element.liste.forEach((tag, indexTag) => {
                if (tag) filtre.push(listeCategoriesTags[indexElt].liste[indexTag])
            })
        });
        const nbImages = (chargePage === null)?NB_IMAGE_PAR_PAGE*(page+1):NB_IMAGE_PAR_PAGE
        const pageDemandee = (chargePage === null)?0:chargePage
        const rep = await fetch_json({filtre: filtreSelec, sourceSelec: sourceSelec, tagsFiltres: filtre,
            typeFiltres: {image: triTypeImage, album: triTypeAlbum, video: triTypeVideo},
            favoriFiltre: triFavori, nbImages: nbImages, page: pageDemandee, tri: triSelec,
            graine: graineForcee ?? graine}, 'post', 'media')
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
        if (mediaSelec === null) {
            if (dernierVu !== null) {
                document.getElementById('media_'+dernierVu)?.scrollIntoView()
                setDernierVu(null)
            }
        }
        else {
            setDernierVu(mediaSelec)
            window.scroll(0, 0)
        }
    })

    //met à jour l'affichage : page 0 = remplacement (montage, reset de filtre), pages suivantes = accumulation
    useEffect(() => {
        if (premiereCharge.current) { premiereCharge.current = false; return }   //montage : l'effet des filtres charge déjà
        const avecAttente = (page === 0 || futurMediaSelec !== null)   //attente visible seulement si elle bloque
        if (avecAttente) dispatch(changeLoading())
        else setChargementPage(true)   //append du scroll infini : indicateur discret en bas de galerie
        chargeListe(page).then(nouvPage => {
            if (nouvPage !== null) {
                if (page === 0) setListe(nouvPage)
                else setListe(prev => [...prev, ...nouvPage])   //fonctionnel : toujours à jour, jamais de doublon de course
            }
            if (futurMediaSelec !== null) {
                setMediaSelec(futurMediaSelec)
                setfuturMediaSelec(null)
            }
            enCours.current = false // sentinelle de nouveau autorisée à déclencher
            if (avecAttente) dispatch(changeLoading())
            setChargementPage(false)
        })
    }, [page])

//définition du filtre d'affichage de la gallerie
useEffect(() => {
    const maVersion = ++version.current   //incrément + capture en une ligne
    if (page === 0) {
        dispatch(changeLoading())
        const nouvelleGraine = Math.random().toString(36).slice(2)
        setGraine(nouvelleGraine)
        chargeListe(null, nouvelleGraine).then(nouvListe => {
            if (version.current !== maVersion) {   //un autre changement de filtre est repassé par là : réponse périmée
                dispatch(changeLoading())
                return
            }
            if (nouvListe !== null) {
                setListe(nouvListe)
            }
            dispatch(changeLoading())
        })
    }
    else
        setPage(0)
}, [filtreSelec, triFavori, triTypeAlbum, triTypeImage, triTypeVideo, triSelec, tagsSelec, sourceSelec])

    //scroll infini : la sentinelle sous la galerie déclenche le chargement de la page suivante
    //à l'approche du viewport (600px d'avance, en accord avec les vignettes lazy)
    useEffect(() => {
        if (sentinelRef.current === null) return   //liste vide : la sentinelle n'est pas montée
        const observateur = new IntersectionObserver(([entree]) => {
            if (entree.isIntersecting && page < maxPage && !enCours.current) {
                enCours.current = true
                setPage(page+1)
            }
        }, {rootMargin: '600px'})
        observateur.observe(sentinelRef.current)
        return () => observateur.disconnect()
    }, [page, maxPage, liste, mediaSelec])

    if (mediaSelec === null) {
//affichage de la gallerie (menus + colonnes de médias)
        return(
            <div className='conteneur'>
                <div className='gestionPage'>
                    <div>
                        {(!affAjoutData)?<input type='button' value='ajouter des médias' onClick={() => {
                            setAffAjoutData(true)
                            setaffFiltre(false)   //les deux overlays partagent le même ancrage : l'un chasse l'autre
                        }} />:null}
                    </div>
                    <div className='filtre'>
                        {(!affFiltre)?<input type='button' value='définir les filtres' onClick={() => {
                            setaffFiltre(true)
                            setAffAjoutData(false) 
                        }} />:null}
                    </div>
                </div>

                {(affFiltre || affAjoutData)?<div className='fondPanneau' onClick={() => {
                    setaffFiltre(false)
                    setAffAjoutData(false)
                }}></div>:null}
                
                {/*zone de saisie pour ajouter de nouveaux médias */}
                {(affAjoutData)?<div className='panneauFixe'>
                    <ZoneAjout affiche={affAjoutData} setAffiche={setAffAjoutData} chargeListe={chargeListe} setListe={setListe} />
                </div>:null}

                {/*zone de sélection des filtres d'affichage des médias */}
                <Filtres affiche={affFiltre} setAffiche={setaffFiltre} filtreSelec={filtreSelec} setfiltreSelec={setfiltreSelec}
                    triSelec={triSelec} setTriSelec={setTriSelec} triTypeVideo={triTypeVideo} setTriTypeVideo={setTriTypeVideo}
                    triTypeImage={triTypeImage} setTriTypeImage={setTriTypeImage} triTypeAlbum={triTypeAlbum} setTriTypeAlbum={setTriTypeAlbum}
                    triFavori={triFavori} setTriFavori={setTriFavori} tagsSelec={tagsSelec} setTagsSelec={setTagsSelec}
                    categorieSelec={categorieSelec} sourceSelec={sourceSelec} setSourceSelec={setSourceSelec} listeSources={listeSource} 
                    setCategorieSelec={setCategorieSelec} listeCategoriesTags={listeCategoriesTags} />

                <Miniatures liste={liste} onSelectMedia={(index) => {
                    setMediaSelec(index)
                }} />
                {(liste.length > 0)?<div ref={sentinelRef} className='sentinelScroll'></div>:null}
                {(chargementPage)?<div className='chargePage'><span></span><span></span><span></span></div>:null}
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