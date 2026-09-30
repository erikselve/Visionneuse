import { useEffect, useState } from 'react'
import { URL_server, PATH_IMAGE, PATH_VIDEO } from "../data/config"
import { useDispatch, useSelector } from 'react-redux'
import { retire, termine, avance } from '../store/slices/mediasCompSlice'
import '../styles/comparateur.css'

function Comparateur() {
    const dispatch = useDispatch()
    // const nomMediaG = useSelector((state) => state.mediasComp.listeSelec[state.mediasComp.indexMediaActuel].name)
    const nomMediaG = useSelector((state) => state.mediasComp.nomMediaActuel)
    const tailleMediaG = useSelector((state) => state.mediasComp.tailleMediaActuelle)
    const infoMediaD = useSelector((state) => state.mediasComp.listeVerif[0])
    const type = useSelector((state) => state.mediasComp.typeMedia)
    const [transmissionTags, setTransmissionTags] = useState(false)

console.log(infoMediaD);

    return(
        <div>
        <div className='action'>
            <span>Les médias sont:</span>
            <input type='button' value={'différents'} onClick={() => {
                dispatch(avance())
            }} />
        </div>
        <div className='princ'>
            <div className='panneau'>
                <div className='media'>
                    {(type === 'image')?<img id='mediaG' src={URL_server+'temp/'+nomMediaG} alt='média à comparer gauche' />:
                    (type === 'video')?<video controls><source src={URL_server+'temp/'+nomMediaG} type="video/mp4" /></video>:null}
                </div>
                <div className='info'>
                    <p>{nomMediaG} ({tailleMediaG.width}x{tailleMediaG.height})</p>
                    <p>
                        <span>Ce média doit être </span>
                        <input type='button' value={'supprimée'} onClick={() => {
                            // const event = new CustomEvent('termine')
                            // document.dispatchEvent(event)
                            dispatch(termine())
                        }} />
                        <span> (En cas d'égalité parfaite celle-ci en priorité)</span>
                    </p>
                </div>
            </div>
            <div className='panneau'>
                {(infoMediaD !== undefined)?<div className='media'>
                    {(type === 'image')?<img id='mediaD' src={URL_server+PATH_IMAGE+infoMediaD.nom} alt='média à comparer droite' />:
                    (type === 'video')?<video controls><source src={URL_server+PATH_VIDEO+infoMediaD.nom} type="video/mp4" /></video>:null}                    
                </div>:null}
                <div className='info'>
                    {(infoMediaD !== undefined)?<p>{infoMediaD.nom} ({infoMediaD.taille.width}x{infoMediaD.taille.height})</p>:null}
                    <div>
                        <span>Ce média doit être </span>
                        <input type='button' value={'supprimée'} onClick={() => {
                            if (transmissionTags) dispatch(retire(infoMediaD.tagsID))
                            else dispatch(retire())
                        }} />
                        {(infoMediaD !== undefined && infoMediaD.tags.length > 0)?<div><input type='checkbox' checked={transmissionTags} onClick={() => {
                            setTransmissionTags(!transmissionTags)
                        }} /><label>transmettre ses <span className='motcle'>tags<div className='tooltip none'>
                            {infoMediaD.tags.map(elt => {
                                return(<div className='tag'>{elt}</div>)
                            })}
                        </div></span> au nouveau média</label></div>:null}
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Comparateur