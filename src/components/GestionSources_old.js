import { useState, useEffect} from 'react'
import { fetch_json, fetch_get } from '../modules/com'
import '../styles/gestionSources.css'
import etoileVide from '../assets/etoileVide.png'
import etoile from '../assets/etoile.png'
import oeil from '../assets/voir.png'
import { infoAnimation, infoGraphisme, infoMiseEnScene, infoSon } from '../data/source'


function GestionSources() {
    const [sources, setSources] = useState([])
    const [chargement, setChargement] = useState(true)
    const [infoNote, setInfoNote] = useState('')
    const [lastSourceIndex, setLastSourceIndex] = useState(-1)
    const [sensTri, setSensTri] = useState(1)
    const [meilleureUrgence, setMeilleureUrgence] = useState(0)
    const max = (infoGraphisme[infoGraphisme.length-1].valeur + infoAnimation[infoAnimation.length-1].valeur) * infoMiseEnScene[infoMiseEnScene.length-1].valeur * infoSon[infoSon.length-1].valeur

    function tri(liste, critere) {
        let action = true
        while (action) {
            action = false
            for (let index = 0; index < liste.length-1; index++) {
                if (sensTri > 0) {
                    if (liste[index][critere] < liste[index+1][critere] ) {
                        let tampon = liste[index]
                        liste[index] = liste[index+1]
                        liste[index+1] = tampon
                        action = true
                    }
                }
                else {
                    if (liste[index][critere] > liste[index+1][critere] ) {
                        let tampon = liste[index]
                        liste[index] = liste[index+1]
                        liste[index+1] = tampon
                        action = true
                    }
                }
            }                        
        }
        return liste
    }

    function afficheNote(note, type, auteur, infos) {
        let suiteNotes = []
        const noteMax = infos.length
        for (let pos = 0; pos < noteMax; pos++) {
            suiteNotes = [...suiteNotes, <img key={type+'_'+pos} src={(pos <= note)?etoile:etoileVide} className='icone clicable' alt='etoile' onClick={() => {
                fetch_json({type: type, nouvelleNote: pos, auteur: auteur}, 'PUT', 'source/note/').then((rep) => {
                    formateListeSource(rep.liste)
                    // setSources(rep.liste)
                })
            }} onMouseOver={() => setInfoNote({texte: infos[pos].msg, source: auteur})} onMouseLeave={() => setInfoNote('')} />]
        }
        return(<span>{suiteNotes}</span>)
    }

    function calculeEval(source) {
        return (infoGraphisme[source.graphisme].valeur + infoAnimation[source.animation].valeur) * infoMiseEnScene[source.miseEnScene].valeur * infoSon[source.son].valeur * 100 / max
    }

    function calculeUrgence(source) {
        return source.urgence * source.evaluation / 100 
    }

    function formateListeSource(liste) {
        let res = []
        let grandeUrgence = 0
        liste.forEach(element => {
            element.evaluation = calculeEval(element)
            element.urgence = calculeUrgence(element)
            res.push(element)

            if (element.urgence > grandeUrgence) grandeUrgence = element.urgence 
        })
        setMeilleureUrgence(grandeUrgence)
        setSources(res)
    }

    useEffect(() => {
        
        fetch_get('source').then(async (rep) => {
            formateListeSource(rep.liste)
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
                    formateListeSource(rep.liste)
                    setLastSourceIndex(rep.liste.findIndex((elt) => elt.nom === rep.auteur))
                    document.getElementById('F95URL').value = ''
                })
            }} />
            <input type='button' value='trier selon urgence' onClick={() => {
                setSources(tri(sources, "urgence"))
                setSensTri(sensTri * -1)
            }} />
            <input type='button' value='trier selon évaluation' onClick={() => {
                setSources(tri(sources, "evaluation"))
                setSensTri(sensTri * -1)
            }} />
            <div>    
                {(lastSourceIndex !== -1)?<div className='affSource'>
                        <label>Dernier ajout:</label>
                        <div className='nom'><span>{sources[lastSourceIndex].nom}</span><img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                            fetch_json({source: sources[lastSourceIndex]._id},'PATCH','source/consulte/').then((rep) => {
                                formateListeSource(rep.liste)
                                // setSources(rep.liste)
                            })
                        }} /></div>
                        <div>
                            <div className='notes'>
                                <span>graphisme {afficheNote(sources[lastSourceIndex].graphisme, 'graphisme', sources[lastSourceIndex].nom, infoGraphisme)}</span>
                                <span>animation {afficheNote(sources[lastSourceIndex].animation, 'animation', sources[lastSourceIndex].nom, infoAnimation)}</span>
                                <span>mise en scène {afficheNote(sources[lastSourceIndex].miseEnScene, 'miseEnScene', sources[lastSourceIndex].nom, infoMiseEnScene)}</span>
                                <span>son {afficheNote(sources[lastSourceIndex].son, 'son', sources[lastSourceIndex].nom, infoSon)}</span>
                            </div>
                            <div className='infoNote'><span>{(sources[lastSourceIndex].nom === infoNote.source)?infoNote.texte:''}</span></div>
                        </div>
                        <div className='bilan'>
                            <span>Evaluation {sources[lastSourceIndex].evaluation.toFixed(2)}%</span>
                            <span>A surveiller {(sources[lastSourceIndex].urgence*100/meilleureUrgence).toFixed(2)}%</span>
                        </div>
                    </div>:null
                }
            </div>
            <div>
                {sources.map((source) => {
                    // const evaluation = calculeEval(source)
                    const urgence = source.urgence * 100 / meilleureUrgence                    
                    
                    return(<div key={source._id} className='affSource'>
                        <div className='nom'><span>{source.nom}</span><img src={oeil} className='icone clicable' alt='consulte' onClick={() => {
                            fetch_json({source: source._id},'PATCH','source/consulte/').then((rep) => {
                                formateListeSource(rep.liste)
                                // setSources(rep.liste)
                            })
                        }} /></div>
                        <div>
                            <div className='notes'>
                                <span>graphisme {afficheNote(source.graphisme, 'graphisme', source.nom, infoGraphisme)}</span>
                                <span>animation {afficheNote(source.animation, 'animation', source.nom, infoAnimation)}</span>
                                <span>mise en scène {afficheNote(source.miseEnScene, 'miseEnScene', source.nom, infoMiseEnScene)}</span>
                                <span>son {afficheNote(source.son, 'son', source.nom, infoSon)}</span>
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