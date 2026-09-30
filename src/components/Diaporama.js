import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetch_json, fetch_get } from '../modules/com'
import { URL_server, PATH_IMAGE } from "../data/config"
import { changeDiaporama } from '../store/slices/displaySlice'
import boutonStop from '../assets/stop.png'
import '../styles/diaporama.css'

function Diaporama(props) {
    const dispatch = useDispatch()
    const [listeImagesPreparees, setListeImagesPreparees] = useState([])
    const [interval, intervalSet] = useState(null)
    let nbTagAnimeMax = 6
    if (listeImagesPreparees.length > 0) {
        if (listeImagesPreparees[0].tags.length > 5) nbTagAnimeMax = 6
        else nbTagAnimeMax = listeImagesPreparees[0].tags.length
    }
    let nbTagAnime = 0
    let positionSelec = [[false, false], [false, false], [false, false], [false, false], [false, false]]

    async function animTag() {
        if (nbTagAnimeMax > 0) {
            let position = Math.floor(Math.random()*5)
            let cote = Math.floor(Math.random()*2)
            while (positionSelec[position][cote]) {
                position = Math.floor(Math.random()*5)
                cote = Math.floor(Math.random()*2)
            }
            positionSelec[position][cote] = true
            let conteneur = document.getElementById('conteneurDiaporama')
            if (nbTagAnime < nbTagAnimeMax) {
                nbTagAnime++
            }
            else {
                const listeSpan = conteneur.getElementsByTagName('span')
                if (listeSpan.length > 0) {
                    listeImagesPreparees[0].tags[listeSpan[0].index].selec = false
                    positionSelec[listeSpan[0].position][listeSpan[0].cote] = false
                    conteneur.removeChild(listeSpan.item(0))
                }
            }
            let span = document.createElement('span')
            const tagsDispos = listeImagesPreparees[0].tags.filter(elt => !elt.selec)
            const indexTagSelec = tagsDispos[Math.floor(Math.random()*tagsDispos.length)].index
            listeImagesPreparees[0].tags[indexTagSelec].selec = true
            span.innerText = listeImagesPreparees[0].tags[indexTagSelec].tag
            span.index = indexTagSelec
            span.position = position
            span.cote = cote
            span.className = 'divTag pos-'+position+'-'+cote
            conteneur.appendChild(span)
        }  
    }

    async function nettoyage() {
        let conteneur = document.getElementById('conteneurDiaporama')
        const listeSpan = conteneur.getElementsByTagName('span')
        while (listeSpan.length > 0) {
            const element = listeSpan.item(0);
            conteneur.removeChild(element)
        }
    }

    async function initialise() {
        nbTagAnimeMax = 6
        if (listeImagesPreparees.length > 0) {
            if (listeImagesPreparees[0].tags.length > 5) nbTagAnimeMax = 6
            else nbTagAnimeMax = listeImagesPreparees[0].tags.length
        }
        nbTagAnime = 0      
        positionSelec = [[false, false], [false, false], [false, false], [false, false], [false, false]]
        // interval = setInterval(animTag, 2000)
    }

    useEffect(() => {
        if (listeImagesPreparees.length > 0 && props.working) {
            const element = document.getElementById('conteneurDiaporama')
            element.requestFullscreen()
            intervalSet(setInterval(animTag, 2000))
        }
    }, [props])

    useEffect(() => {
        for (let index = 0; index < 10; index++) {
            fetch_get('media/diaporama').then(rep => {
                if (rep) {
                    rep.tags = rep.tags.map((elt, index) => {return {tag: elt, selec: false, index: index}})
                    setListeImagesPreparees([...listeImagesPreparees, rep])
                }
            })  
        }
    }, [])

    useEffect(() => {
        if (props.working)
            intervalSet(setInterval(animTag, 2000))
    }, [listeImagesPreparees])

    if (listeImagesPreparees.length > 0) {
        const image = listeImagesPreparees[0]
        return (
            <div id='conteneurDiaporama' className={(image.taille.width > image.taille.height)?'conteneurDiaporama paysage':'conteneurDiaporama portrait'}>
                <img src={URL_server+PATH_IMAGE+image.name} onClick={() => {
                    clearInterval(interval)
                    nettoyage().then(() => {
                        fetch_get('diaporama').then(rep => {
                            if (rep) {
                                rep.res.tags = rep.res.tags.map((elt, index) => {return {tag: elt, selec: false, index: index}})
                                setListeImagesPreparees([...listeImagesPreparees.filter((elt, index) => index !== 0), rep.res])
                            }
                        })
                    })

                }} />
                <div className='boutonStop'>
                    <img src={boutonStop} onClick={async () => {
                        clearInterval(interval)
                        document.exitFullscreen()
                        nettoyage()
                        dispatch(changeDiaporama())
                        intervalSet(null)
                    }} />
                </div>
            </div>
        )
    }
    else return(<div></div>)
}

export default Diaporama