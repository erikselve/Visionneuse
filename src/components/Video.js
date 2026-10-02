import { URL_server, PATH_VIDEO } from "../data/config"
import { useDispatch, useSelector } from 'react-redux'
import '../styles/video.css'
import AffichageTagsMedia from "./AffichageTagsMedia"
import bordureHaut from '../assets/bordure_video_haut.png'
import bordureBas from '../assets/bordure_video_bas.png'
import bordure from '../assets/bordure_video_centre.png'
import { useState } from "react"
import { animated, useSpring } from '@react-spring/web'

//props obligatoires
//  - nom: nom de l'album / chemin vers l'image de couverture
//  - display: mini=affichage d'une miniature, complet=affichage détaillé
//  - orientation: paysage ou portrait
function Video(props) {
    const [affMiniVideo, setAffMiniVideo] = useState(false)
    const boucle = useSelector((state) => state.display.boucle)
    const [springs, api] = useSpring(() => ({config: {duration: 5000}}, {from: {width: '0%'}}))

    if (props.display === 'mini') {
        const couverture = props.nom.split('.')[0]+'.jpg'
        return(
            <div>
                {/* <div className="conteneurVideoMini" onMouseEnter={() => {setAffMiniVideo(true)}} onMouseLeave={() => {setAffMiniVideo(false)}}> */}
                <div className="conteneurVideoMini" onMouseEnter={() => {api.start({from: {width: '0%'}, to: {width: '100%'}})}} onMouseLeave={() => {api.set({width: '0%'})}}>
                {(affMiniVideo)?
                    <video autoPlay><source src={URL_server+PATH_VIDEO+props.nom} type="video/mp4" /></video>:
                    <div>
                        {/* <div className="barre"><animated.div style={{...springs}} className='barreRemplie'></animated.div></div> */}
                        <img src={URL_server+PATH_VIDEO+'couvertures/'+couverture} className='couverture' alt="présentation de la vidéo" />
                    </div>
                }
                </div>
            </div>
        )
    }
    else if (props.display === 'complet') {
        return(
                <div className="conteneurVideo">
                    <AffichageTagsMedia media={props.nom} />
                    <div className="video"><video className={props.orientation} preload="auto" loop={boucle} controls src={URL_server+PATH_VIDEO+props.nom}></video></div>
                </div>
        )
    }
}

export default Video