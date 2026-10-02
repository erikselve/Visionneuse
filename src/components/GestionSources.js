import { useState, useEffect} from 'react'
import { fetch_json, fetch_get } from '../modules/com'
import '../styles/gestionSources.css'
import etoileVide from '../assets/etoileVide.png'
import etoile from '../assets/etoile.png'
import oeil from '../assets/voir.png'
import { infoAnimation, infoGraphisme, infoMiseEnScene, infoSon } from '../data/source'
import { chargeSources, triSources, changeDerniereSource } from '../store/slices/sourceSlice'
import { useSelector, useDispatch } from 'react-redux'


function GestionSources() {
    const dispatch = useDispatch()
    const sources = useSelector((state) => state.sources.sources)
    const derniereSource = useSelector((state) => state.sources.derniereSourceUtilisee)
    const meilleureUrgence = useSelector((state) => state.sources.plusGrandeUrgence)
    const [chargement, setChargement] = useState(true)
    const [infoNote, setInfoNote] = useState({texte: '', source: ''})

    function afficheNote(note, type, auteur, infos, calcul) {
        let suiteNotes = []
        const noteMax = infos.length
        for (let pos = 0; pos < noteMax; pos++) {
            suiteNotes = [...suiteNotes, <img key={type+'_'+pos} src={(pos <= note)?etoile:etoileVide} className={(calcul)?'icone':'icone clicable'} alt='etoile' onClick={(calcul)?undefined:() => {
                fetch_json({type: type, nouvelleNote: pos, auteur: auteur}, 'PUT', 'source/note/').then((rep) => {
                    dispatch(chargeSources(rep.liste))
                })
            }} onMouseOver={() => setInfoNote({texte: infos[pos].msg, source: auteur})} onMouseLeave={() => setInfoNote({texte: '', source: ''})} />]
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
            <label>Saisir l'url de la source F95 ici:</label><br/>
            <input type='text' id='F95URL' /><input type='button' value='Envoyer' onClick={() => {
                fetch_json({url: document.getElementById('F95URL').value}, 'POST', 'source/ajout/f95').then((rep) => {
                    dispatch(chargeSources(rep.liste))
                    dispatch(changeDerniereSource(rep.auteur))
                    document.getElementById('F95URL').value = ''
                })
            }} />
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
                                <span>graphisme {afficheNote(derniereSource.graphisme, 'graphisme', derniereSource.nom, infoGraphisme, (derniereSource.notesCalculees && derniereSource.notesCalculees.graphisme !== undefined))}</span>
                                <span>animation {afficheNote(derniereSource.animation, 'animation', derniereSource.nom, infoAnimation, (derniereSource.notesCalculees && derniereSource.notesCalculees.animation !== undefined))}</span>
                                <span>mise en scène {afficheNote(derniereSource.miseEnScene, 'miseEnScene', derniereSource.nom, infoMiseEnScene, (derniereSource.notesCalculees && derniereSource.notesCalculees.miseEnScene !== undefined))}</span>
                                <span>son {afficheNote(derniereSource.son, 'son', derniereSource.nom, infoSon, (derniereSource.notesCalculees && derniereSource.notesCalculees.son !== undefined))}</span>
                            </div>
                            <div className='infoNote'><span>{(derniereSource.nom === infoNote.source)?infoNote.texte:''}</span></div>
                        </div>
                        <div className='bilan'>
                            <span>Evaluation {derniereSource.evaluation.toFixed(2)}%</span>
                            <span>A surveiller {(derniereSource.urgence*100/meilleureUrgence).toFixed(2)}%</span>
                        </div>
                    </div>:null
                }
            </div>
            <div>
                {sources.map((source) => {
                    const urgence = source.urgence * 100 / meilleureUrgence                    
                    
                    return(<div key={source._id} className='affSource'>
                        <div className='nom'><span>{source.nom}</span><img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                            fetch_json({source: source._id},'PATCH','source/consulte/').then((rep) => {
                                dispatch(chargeSources(rep.liste))
                            })
                        }} /></div>
                        <div>
                            <div className='notes'>
                                <span>graphisme {afficheNote(source.graphisme, 'graphisme', source.nom, infoGraphisme, (source.notesCalculees && source.notesCalculees.graphisme !== undefined))}</span>
                                <span>animation {afficheNote(source.animation, 'animation', source.nom, infoAnimation, (source.notesCalculees && source.notesCalculees.animation !== undefined))}</span>
                                <span>mise en scène {afficheNote(source.miseEnScene, 'miseEnScene', source.nom, infoMiseEnScene, (source.notesCalculees && source.notesCalculees.miseEnScene !== undefined))}</span>
                                <span>son {afficheNote(source.son, 'son', source.nom, infoSon, (source.notesCalculees && source.notesCalculees.son !== undefined))}</span>
                            </div>
                            <div className='infoNote'><span>{(source.nom === infoNote.source)?infoNote.texte:''}</span></div>
                        </div>
                        <div className='bilan'>
                            <span>Evaluation {source.evaluation.toFixed(2)}%</span>
                            <span>A surveiller {urgence.toFixed(2)}% ({source.origines.find(element => element.nom === 'f95')['derniereRecup']})</span>
                        </div>
                    </div>)
                })}
            </div>
        </div>)
}

export default GestionSources