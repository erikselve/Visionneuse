import { useState, useEffect} from 'react'
import { fetch_json, fetch_get } from '../modules/com'
import '../styles/gestionSources.css'
import '../styles/panneaux.css'
import etoileVide from '../assets/etoileVide.png'
import etoile from '../assets/etoile.png'
import oeil from '../assets/voir.png'
import crayon from '../assets/crayon.png'
import boutonAjout from '../assets/alias.png'
import { chargeSources, triSources, changeDerniereSource } from '../store/slices/sourceSlice'
import { useSelector, useDispatch } from 'react-redux'


function GestionSources() {
    const dispatch = useDispatch()
    const sources = useSelector((state) => state.sources.sources)
    const derniereSource = useSelector((state) => state.sources.derniereSourceUtilisee)
    const meilleureUrgence = useSelector((state) => state.sources.plusGrandeUrgence)
    const [chargement, setChargement] = useState(true)
    const [infoNote, setInfoNote] = useState({texte: '', source: '', critere: ''})
    const listeNom = useSelector((state) => state.sources.listeNomAlphab)
    const [nomTape, setNomTape] = useState('')
    const [sourceRenommee, setSourceRenommee] = useState(null)
    const [sourceAlias, setSourceAlias] = useState(null)
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
                <div className='carteAction'>
                    <h4>Ajouter une source F95</h4>
                    <div className='ligneSaisie'>
                        <input type='text' id='F95URL' placeholder='URL du thread…' />
                        <input type='button' value='Envoyer' onClick={() => {
                            fetch_json({url: document.getElementById('F95URL').value}, 'POST', 'source/ajout/f95').then((rep) => {
                                if (rep) {
                                    dispatch(chargeSources(rep.liste))
                                    dispatch(changeDerniereSource(rep.auteur))
                                    document.getElementById('F95URL').value = ''
                                }
                            })
                        }} />
                    </div>
                </div>
                <div className='carteAction'>
                    <h4>Ajout manuel</h4>
                    <div className='ligneSaisie'>
                        <div className='zoneSaisieLien'>
                            {(nomTape.trim() !== '')?<div className='suggestionsLien'>
                                {listeNom
                                    .filter((elt) => {
                                        const t = nomTape.trim().toLowerCase()
                                        const dejaExact = (elt.nom.toLowerCase() === t || elt.nomUsage.toLowerCase() === t || elt.alias.some(a => a.toLowerCase() === t))
                                        return !dejaExact && (
                                            elt.nom.toLowerCase().startsWith(t) ||            // ← la ligne manquante
                                            elt.nomUsage.toLowerCase().startsWith(t) ||
                                            elt.alias.some(a => a.toLowerCase().startsWith(t))
                                        )
                                    })
                                    .map((elt) => <div key={elt.nom} className='suggestion' onClick={() => setNomTape(elt.nomUsage)}>{elt.nomUsage}</div>)}
                            </div>:null}
                            <input type='text' value={nomTape} onChange={(e) => setNomTape(e.target.value)} placeholder='Nom de la source…' />
                        </div>
                        <input type='button' value='Envoyer' onClick={() => {
                            const nom = nomTape.trim()
                            if (nom !== '') {
                                fetch_json({nom: nom}, 'POST', 'source/ajoutManuel').then((rep) => {
                                    if (rep) {
                                        dispatch(chargeSources(rep.liste))
                                        dispatch(changeDerniereSource(rep.auteur))
                                        setNomTape('')
                                    }
                                })
                            }
                        }} />
                    </div>
                </div>
                <div className='carteAction'>
                    <h4>Trier la liste</h4>
                    <div className='partage'>
                        <input type='button' value='selon urgence' onClick={() => {
                            dispatch(triSources("urgence"))
                        }} />
                        <input type='button' value='selon évaluation' onClick={() => {
                            dispatch(triSources("evaluation"))
                        }} />
                    </div>
                </div>
                {(derniereSource !== null)?<div className='affSource affSourceDerniere'>
                    <div className='nom'><span>{derniereSource.nomUsage}</span><img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
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
                </div>:null}
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
                            <span>{source.nomUsage}</span>
                            <img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                                fetch_json({source: source._id},'PATCH','source/consulte/').then((rep) => {
                                    dispatch(chargeSources(rep.liste))
                                })
                            }} />
                            <img src={crayon} className='icone clicable' alt='renommer' onClick={() => {
                                setSourceRenommee((sourceRenommee === source.nom)?null:source.nom)
                            }} />
                            <img src={boutonAjout} className='icone clicable' alt='alias' onClick={() => {
                                setSourceAlias((sourceAlias === source.nom)?null:source.nom)
                            }} />
                        </div>
                        {(sourceRenommee === source.nom)? <div className='saisieRenomme'>
                            <input type='text' defaultValue={source.nomUsage} id={'renomme_'+source._id} />
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
                        {(sourceAlias === source.nom)?<div className='saisieRenomme'>
                            <input type='text' id={'alias_'+source._id} />
                            <input type='button' value='valider' onClick={() => {
                                fetch_json({nom: source.nom, alias: document.getElementById('alias_'+source._id).value}, 'put', 'source/alias').then(rep => {
                                    if (rep) { dispatch(chargeSources(rep.liste)); setSourceAlias(null) }
                                })
                            }} />
                            <input type='button' value='annuler' onClick={() => setSourceAlias(null)} />
                        </div>:null}                        
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