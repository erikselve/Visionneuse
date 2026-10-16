import { URL_server, PATH_VIDEO } from "../data/config"
import { useSelector } from 'react-redux'
import '../styles/video.css'
import AffichageTagsMedia from "./AffichageTagsMedia"
import { useState, useRef } from "react"
import Vignette from "./Vignette"

//props obligatoires
//  - nom: nom de l'album / chemin vers l'image de couverture
//  - display: mini=affichage d'une miniature, complet=affichage détaillé
//  - orientation: paysage ou portrait
function Video(props) {
    const [affMiniVideo, setAffMiniVideo] = useState(false)
    const timerSurvol = useRef(null)
    const boucle = useSelector((state) => state.display.boucle)

    if (props.display === 'mini') {
        const couverture = props.nomFichier.split('.')[0]+'.jpg'
        return(
            <div>
                <div className="conteneurVideoMini" onMouseEnter={() => {timerSurvol.current = setTimeout(() => setAffMiniVideo(true), 400)}} onMouseLeave={() => {clearTimeout(timerSurvol.current); setAffMiniVideo(false)}}>
                    <Vignette src={URL_server+PATH_VIDEO+'couvertures/'+couverture} alt="présentation de la vidéo" className="couverture" largeur={props.taille?.width} hauteur={props.taille?.height} />
                    {(affMiniVideo)?
                        <video autoPlay muted loop playsInline className='clipApercu' src={URL_server+PATH_VIDEO+'couvertures/clip_'+props.nomFichier.split('.')[0]+'.mp4'} />:null                }
                </div>
            </div>
        )
    }
    else if (props.display === 'complet') {
        return(
                <div className="conteneurVideo">
                    <AffichageTagsMedia id={props.id} media={props.nom} />
                    <div className="video"><video className={props.orientation} preload="auto" loop={boucle} controls src={URL_server+PATH_VIDEO+props.nomFichier}></video></div>
                </div>
        )
    }
}

export default Video