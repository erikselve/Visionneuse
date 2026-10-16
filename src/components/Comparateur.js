import { useEffect, useState } from 'react'
import { URL_server, PATH_IMAGE, PATH_VIDEO } from "../data/config"
import { useDispatch, useSelector } from 'react-redux'
import { retire, termine, avance } from '../store/slices/mediasCompSlice'
import '../styles/panneaux.css'
import '../styles/comparateur.css'

function Comparateur() {
    const dispatch = useDispatch()
    const nomMediaG = useSelector((state) => state.mediasComp.nomMediaActuel)
    const tailleMediaG = useSelector((state) => state.mediasComp.tailleMediaActuelle)
    const infoMediaD = useSelector((state) => state.mediasComp.listeVerif[0])
    const type = useSelector((state) => state.mediasComp.typeMedia)
    const [transmissionInfos, setTransmissionInfos] = useState(false)
    const sourceNouveau = useSelector((state) => state.mediasComp.sourceNouveau)
    const aDesNotes = (infoMediaD !== undefined) && infoMediaD.notes !== null && Object.values(infoMediaD.notes).some(v => v !== null)

    return(
        <div className='contenu'>
            <div className='entetePanneau'>
                <span>Les médias sont </span>
                <input type='button' value={'différents'} onClick={() => dispatch(avance())} />
            </div>
            <div className='princ'>
                <div className='panneau groupe'>
                    <div className='media'>
                        {(type === 'image')?<img id='mediaG' src={URL_server+'temp/'+nomMediaG} alt='média à comparer gauche' />:
                        (type === 'video')?<video controls><source src={URL_server+'temp/'+nomMediaG} type="video/mp4" /></video>:null}
                    </div>
                    <div className='info'>
                        <p>{nomMediaG} ({tailleMediaG.width}x{tailleMediaG.height})</p>
                        <p>
                            <span>Ce média doit être </span>
                            <input type='button' value={'supprimée'} onClick={() => {
                                dispatch(termine())
                            }} />
                        </p>
                        <p className='note'>En cas d'égalité parfaite, celui-ci en priorité.</p>
                    </div>
                </div>
                <div className='panneau groupe'>
                    {(infoMediaD !== undefined)?<div className='media'>
                        {(type === 'image')?<img id='mediaD' src={URL_server+PATH_IMAGE+infoMediaD.nomFichier} alt='média à comparer droite' />:
                        (type === 'video')?<video controls><source src={URL_server+PATH_VIDEO+infoMediaD.nomFichier} type="video/mp4" /></video>:null}                    
                    </div>:null}
                    <div className='info'>
                        {(infoMediaD !== undefined)?<p>{infoMediaD.nom} ({infoMediaD.taille.width}x{infoMediaD.taille.height})</p>:null}
                        <div>
                            <span>Ce média doit être </span>
                            <input type='button' value={'supprimée'} onClick={() => {
                                if (transmissionInfos) dispatch(retire({tags: infoMediaD.tagsID, favori: infoMediaD.favori, notes: infoMediaD.notes, source: infoMediaD.source}))
                                else dispatch(retire())
                            }} />
                            {(infoMediaD !== undefined && (infoMediaD.tags.length > 0 || infoMediaD.favori || aDesNotes || infoMediaD.source !== null))?<div>
                                <input type='checkbox' checked={transmissionInfos} onClick={() => setTransmissionInfos(!transmissionInfos)} />
                                <label>transmettre ses <span className='motcle'>
                                    informations
                                    <div className='tooltip none'>
                                        {(infoMediaD.favori)?<div className='favori'>♥ favori</div>:null}
                                        {(aDesNotes)?<div>{Object.entries(infoMediaD.notes).filter(([k, v]) => v !== null)
                                            .map(([k, v]) => k+' '+v).join(' · ')}</div>:null}
                                        {(infoMediaD.source !== null)?<div>source : {infoMediaD.source}</div>:null}
                                        {(infoMediaD.source !== null && sourceNouveau !== null && infoMediaD.source !== sourceNouveau)?
                                            <div className='conflitSource'>⚠ « {infoMediaD.source} » remplacera « {sourceNouveau} »</div>:null}
                                            {(infoMediaD.tags.length > 0)?<div className='ligneTags'>
                                                {infoMediaD.tags.map(elt => <div className='tag'>{elt}</div>)}
                                            </div>:null}
                                    </div>
                                </span> au nouveau média</label>
                            </div>:null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comparateur