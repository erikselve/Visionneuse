import { changeFavori } from "../store/slices/displaySlice"
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import boutonStop from '../assets/stop.png'
import '../styles/affichFavori.css'
import { URL_server, PATH_VIDEO } from "../data/config"
import { fetch_json } from '../modules/com'

function AffichFavori(props) {
    const dispatch = useDispatch()

    useEffect(() => {
        const element = document.getElementById('conteneurFavori')
        element.requestFullscreen()
    }, [props])

    return(<div id="conteneurFavori" className="conteneurFavori">
        {(props.favori.type === 'video')?<video onEnded={() => {
            document.exitFullscreen()
            dispatch(changeFavori(null))
        }} className={(props.favori.taille.height > props.favori.taille.width)?'portrait':'paysage'} autoPlay="true" controls><source src={URL_server+PATH_VIDEO+props.favori.nom} type="video/mp4" /></video>:null}
        <div className='boutonStop'>
            <img src={boutonStop} onClick={async () => {
                document.exitFullscreen()
                dispatch(changeFavori(null))
            }} />
        </div>
    </div>)
}

export default AffichFavori