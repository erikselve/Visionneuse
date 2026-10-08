import { useState, useEffect} from 'react'
import { fetch_json, fetch_get } from '../modules/com'
import '../styles/gestionSources.css'
import etoileVide from '../assets/etoileVide.png'
import etoile from '../assets/etoile.png'
import oeil from '../assets/voir.png'
import crayon from '../assets/crayon.png'
import { chargeSources, triSources, changeDerniereSource } from '../store/slices/sourceSlice'
import { useSelector, useDispatch } from 'react-redux'


function GestionSources() {
    const dispatch = useDispatch()
    const sources = useSelector((state) => state.sources.sources)
    const derniereSource = useSelector((state) => state.sources.derniereSourceUtilisee)
    const meilleureUrgence = useSelector((state) => state.sources.plusGrandeUrgence)
    const [chargement, setChargement] = useState(true)
    const [infoNote, setInfoNote] = useState({texte: '', source: '', critere: ''})
    const listeNomManuel = useSelector((state) => state.sources.listeNomAlphab.filter((elt) => elt.manuel))
    const [nomTape, setNomTape] = useState('')
    const [sourceRenommee, setSourceRenommee] = useState(null)
    const notation = useSelector((state) => state.sources.notation)

    function afficheNote(note, type, auteur, calcul) {
        let suiteNotes = []
        const infos = notation.echelles[type]
        const noteMax = infos.length
        for (let pos = 0; pos < noteMax; pos++) {
            suiteNotes = [...suiteNotes, <img key={type+'_'+pos} src={(pos <= note)?etoile:etoileVide} className={(calcul)?'icone':'icone clicable'} alt='etoile' onClick={(calcul)?undefined:() => {
                fetch_json({type: type, nouvelleNote: pos, auteur: auteur}, 'PUT', 'source/note/').then((rep) => {
                    dispatch(chargeSources(rep.liste))
                })
            }} onMouseOver={() => setInfoNote({texte: infos[pos].msg, source: auteur, critere: type})} onMouseLeave={() => setInfoNote({texte: '', source: '', critere: ''})} />]
        }
        return(<span>{suiteNotes}</span>)
    }

    useEffect(() => {
        
        fetch_get('source').then(async (rep) => {
            dispatch(chargeSources(rep.liste))
            setChargement(false)
        })
    }, [])

    if (chargement)
        return(<div><span>En chargement</span></div>)
    else
        return(<div>
            <div className='zoneCtrl'>
                <label>Saisir l'url de la source F95 ici:</label><br/>
                <input type='text' id='F95URL' /><input type='button' value='Envoyer' onClick={() => {
                    fetch_json({url: document.getElementById('F95URL').value}, 'POST', 'source/ajout/f95').then((rep) => {
                        dispatch(chargeSources(rep.liste))
                        dispatch(changeDerniereSource(rep.auteur))
                        document.getElementById('F95URL').value = ''
                    })
                }} /><br/>
                <label>Saisir le nom d'une source:</label><br/>
                <input type='text' value={nomTape} onChange={(e) => setNomTape(e.target.value)} />
                {(nomTape.trim() !== '')?listeNomManuel
                    .filter((elt) => elt.nom.toLowerCase().startsWith(nomTape.toLowerCase()) && elt.nom.toLowerCase() !== nomTape.toLowerCase())
                    .map((elt) => <div key={elt.nom} className='suggestion' onClick={() => setNomTape(elt.nom)}>{elt.nom}</div>)
                :null}
                <input type='button' value='Envoyer' onClick={() => {
                    const nom = nomTape.trim()
                    if (nom !== '') {
                        fetch_json({nom: nom}, 'POST', 'source/ajoutManuel').then((rep) => {
                            dispatch(chargeSources(rep.liste))
                            dispatch(changeDerniereSource(rep.auteur))
                            setNomTape('')
                        })
                    }
                }} /><br/>         
                <input type='button' value='trier selon urgence' onClick={() => {
                    dispatch(triSources("urgence"))
                }} />
                <input type='button' value='trier selon évaluation' onClick={() => {
                    dispatch(triSources("evaluation"))
                }} />
                <div>    
                    {(derniereSource !== null)?<div className='affSource'>
                            <label>Dernier ajout:</label>
                            <div className='nom'><span>{derniereSource.nom}</span><img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                                fetch_json({source: derniereSource._id},'PATCH','source/consulte/').then((rep) => {
                                    dispatch(chargeSources(rep.liste))
                                })
                            }} /></div>
                            <div>
                            <div className='notes'>
                                <span>graphisme {afficheNote(derniereSource.graphisme, 'graphisme', derniereSource.nom, (derniereSource.notesCalculees && derniereSource.notesCalculees.graphisme !== undefined))}
                                    {(derniereSource.nom === infoNote.source && infoNote.critere === 'graphisme')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>animation {afficheNote(derniereSource.animation, 'animation', derniereSource.nom, (derniereSource.notesCalculees && derniereSource.notesCalculees.animation !== undefined))}
                                    {(derniereSource.nom === infoNote.source && infoNote.critere === 'animation')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>mise en scène {afficheNote(derniereSource.miseEnScene, 'miseEnScene', derniereSource.nom, (derniereSource.notesCalculees && derniereSource.notesCalculees.miseEnScene !== undefined))}
                                    {(derniereSource.nom === infoNote.source && infoNote.critere === 'miseEnScene')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>son {afficheNote(derniereSource.son, 'son', derniereSource.nom, (derniereSource.notesCalculees && derniereSource.notesCalculees.son !== undefined))}
                                    {(derniereSource.nom === infoNote.source && infoNote.critere === 'son')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                            </div>
                            </div>
                            <div className='bilan'>
                                <span>Evaluation {derniereSource.evaluation.toFixed(2)}%</span>
                                <span>A surveiller {(derniereSource.urgence*100/meilleureUrgence).toFixed(2)}%</span>
                            </div>
                        </div>:null
                    }
                </div>
            </div>
            <div className='zoneListe'>
                {sources.map((source) => {
                    const urgence = source.urgence * 100 / meilleureUrgence
                    let origine = source.origines[0]
                    source.origines.forEach(elt => {
                        if (elt.derniereRecup > origine.derniereRecup) origine = elt
                    })

                    return(<div key={source._id} className='affSource'>
                        <div className='nom'>
                            <span>{source.nom}</span>
                            <img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                                fetch_json({source: source._id},'PATCH','source/consulte/').then((rep) => {
                                    dispatch(chargeSources(rep.liste))
                                })
                            }} />
                            <img src={crayon} className='icone clicable' alt='renommer' onClick={() => {
                                setSourceRenommee((sourceRenommee === source.nom)?null:source.nom)
                            }} />
                        </div>
                        {(sourceRenommee === source.nom)? <div className='saisieRenomme'>
                            <input type='text' defaultValue={source.nom} id={'renomme_'+source._id} />
                            <input type='button' value='valider' onClick={() => {
                                const nouvNom = document.getElementById('renomme_'+source._id).value
                                fetch_json({ancienNom: source.nom, nouvNom: nouvNom}, 'put', 'source/rename').then(rep => {
                                    if (rep) {
                                        dispatch(chargeSources(rep.liste))
                                        dispatch(changeDerniereSource(rep.auteur))
                                        setSourceRenommee(null)
                                    }
                                })
                            }} />
                            <input type='button' value='annuler' onClick={() => setSourceRenommee(null)} />
                        </div>: null}
                        <div>
                            <div className='notes'>
                                <span>graphisme {afficheNote(source.graphisme, 'graphisme', source.nom, (source.notesCalculees && source.notesCalculees.graphisme !== undefined))}
                                    {(source.nom === infoNote.source && infoNote.critere === 'graphisme')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>animation {afficheNote(source.animation, 'animation', source.nom, (source.notesCalculees && source.notesCalculees.animation !== undefined))}
                                    {(source.nom === infoNote.source && infoNote.critere === 'animation')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>mise en scène {afficheNote(source.miseEnScene, 'miseEnScene', source.nom, (source.notesCalculees && source.notesCalculees.miseEnScene !== undefined))}
                                    {(source.nom === infoNote.source && infoNote.critere === 'miseEnScene')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                                <span>son {afficheNote(source.son, 'son', source.nom, (source.notesCalculees && source.notesCalculees.son !== undefined))}
                                    {(source.nom === infoNote.source && infoNote.critere === 'son')?<span className='infoNote'>{infoNote.texte}</span>:null}
                                </span>
                            </div>
                        </div>
                        <div className='bilan'>
                            <span>Evaluation {source.evaluation.toFixed(2)}%</span>
                            <span>A surveiller {urgence.toFixed(2)}% ({origine.derniereRecup})</span>
                        </div>
                    </div>)
                })}
            </div>
        </div>)
}

export default GestionSources