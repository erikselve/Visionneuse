import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { changeLoading } from '../../store/slices/displaySlice'
import { changeDerniereSource } from '../../store/slices/sourceSlice'
import { fetch_json } from '../../modules/com'
import boutonRetour from '../../assets/flecheHaut.png'
import boutonPrec from '../../assets/flecheGauche.png'
import boutonSuiv from '../../assets/flecheDroite.png'
import boutonPrecGrise from '../../assets/flecheGaucheGrise.png'
import boutonSuivGrise from '../../assets/flecheDroiteGrise.png'
import boutonPoubelle from '../../assets/poubelle2.png'
import favori_vide from '../../assets/coeur_vide.png'
import favori_plein from '../../assets/coeur_plein.png'
import etoile from '../../assets/etoile.png'
import etoileVide from '../../assets/etoileVide.png'
import Image from '../Image'
import Video from '../Video'
import Album from '../Album'
import '../../styles/vueMedia.css'   // si des règles dédiées existent, sinon galerie.css reste

// Vue détaillée d'un média : navigation, favori, suppression, source, notes.
// Reçoit le média et les mécanismes de pagination de Galerie ;

function VueMedia({liste, mediaSelec, setMediaSelec, page, maxPage, setPage, setfuturMediaSelec,
        setListe, chargeListe, listeSource}) {

    const [infoNote, setInfoNote] = useState({texte: '', critere: ''})   // déménagé de Galerie
    const notation = useSelector((state) => state.sources.notation)
    const criteres = [
        {nom: 'graphisme', libelle: 'Graphisme', echelle: notation.echelles['graphisme']},
        {nom: 'animation', libelle: 'Animation', echelle: notation.echelles['animation']},
        {nom: 'miseEnScene', libelle: 'Mise en scène', echelle: notation.echelles['miseEnScene']},
        {nom: 'son', libelle: 'Son', echelle: notation.echelles['son']}
    ]
    const dispatch = useDispatch()

    function afficheNote(note, critere) {
        let suiteNotes = []
        for (let pos = 0; pos < notation.echelles[critere.nom].length; pos++) {
            suiteNotes = [...suiteNotes, <img key={critere.nom+'_'+pos} src={(pos <= note)?etoile:etoileVide} className='icone clicable' alt='etoile' onClick={() => {
                const notes = {...(liste[mediaSelec].notes ?? {})}
                notes[critere.nom] = (pos === note)?null:pos
                fetch_json({id: liste[mediaSelec].id, notes: notes}, 'put', 'media/notes').then(rep => {
                    if (rep) setListe(liste.map((elt, index) => {
                        if (index === mediaSelec) elt.notes = notes
                        return elt
                    }))
                })
            }} onMouseOver={() => setInfoNote({texte: notation.echelles[critere.nom][pos].msg, critere: critere.nom})} onMouseLeave={() => setInfoNote({texte: '', critere: ''})} />]
        }
        return(<span>{suiteNotes}</span>)
    }

    let orientation = (liste[mediaSelec].taille.width > liste[mediaSelec].taille.height)?'paysage':'portrait'
    return(
        <div className='conteneurComplet'>
            <div className="conteneurInfo">
                <div className="navigation">
                    {(mediaSelec > 0)?<img src={boutonPrec} alt="média précédent" className="icone clicable"
                        onClick={() => { setMediaSelec(mediaSelec-1) }} />:<img src={boutonPrecGrise} alt="média précédent indisponible" className="icone" />}
                    <img src={boutonRetour} alt="retour à la gallerie" className="icone clicable" onClick={() => {
                        setMediaSelec(null)
                    }} />
                    {(mediaSelec < liste.length-1 || page < maxPage)?<img src={boutonSuiv} alt="média suivant"
                        className="icone clicable" onClick={() => {
                        if (mediaSelec < liste.length-1) setMediaSelec(mediaSelec+1)
                        else { setPage(page+1); setfuturMediaSelec(liste.length) }   //charger la suite et atterrir dessus
                    }} />:<img src={boutonSuivGrise} alt="média suivant indisponible" className="icone" />}
                </div>
                <div className="info">
                    <div>
                        <img className='icone clicable' src={(liste[mediaSelec].favori)?favori_plein:favori_vide} onClick={() => {
                            fetch_json({id: liste[mediaSelec].id}, 'put', 'media/favori').then(rep => {
                                if (rep) setListe(liste.map((elt, index) => {
                                    if (index === mediaSelec) elt.favori = !elt.favori
                                    return elt
                                }))
                            })
                        }} />
                        <span>{liste[mediaSelec].name}</span>
                    </div>
                    <img src={boutonPoubelle} alt="supprimer le média" className="icone clicable inv" onClick={() => {
                        setMediaSelec(null)
                        dispatch(changeLoading())
                        fetch_json({name: liste[mediaSelec].name}, 'delete', liste[mediaSelec].type).then(rep => {
                            if (rep) {
                                chargeListe().then(nouvListe => {
                                    if (nouvListe !== null) {
                                        setListe(nouvListe)
                                    }
                                    dispatch(changeLoading())
                                })
                            }
                            else dispatch(changeLoading())   // requête échouée : on ne reste pas bloqués en attente
                        })
                    }} />
                </div>
            </div>
            <div className='conteneurInfo'>
                <div className='navigation'>
                    <label htmlFor ='source'>Auteur :</label>
                    <select id='source' value={liste[mediaSelec].source ?? 'Inconnu'} onChange={(e) => {
                        const source = e.target.value
                        fetch_json({id: liste[mediaSelec].id, source: source}, 'put', 'media/source').then(rep => {
                            if (rep) {
                                setListe(liste.map((elt, index) => {
                                    if (index === mediaSelec) elt.source = source
                                    return elt
                                }))
                                if (source !== 'Inconnu') dispatch(changeDerniereSource(source))
                            }
                        })
                    }}>
                        {listeSource.map((elt) => <option key={elt.nom} value={elt.nom}>{elt.nom}</option>)}
                    </select>
                </div>
                <div className='info'>
                {criteres.filter((critere) => notation.criteresParType[liste[mediaSelec].type].includes(critere.nom)).map(critere => (
                        <div key={critere.nom}>
                            <label>{critere.libelle} :</label>
                            {afficheNote((liste[mediaSelec].notes && liste[mediaSelec].notes[critere.nom] !== null)?liste[mediaSelec].notes[critere.nom]:-1, critere)}
                            {(infoNote.critere === critere.nom)?<span className='infoNote'>{infoNote.texte}</span>:null}
                        </div>
                    ))}
                </div>
            </div>
            {(liste[mediaSelec].type === 'image')?<Image display='complet' nom={liste[mediaSelec].name} id={liste[mediaSelec].id} />:
            (liste[mediaSelec].type === 'video')?<Video display='complet' orientation={orientation} nom={liste[mediaSelec].name} id={liste[mediaSelec].id} />:
            <Album display='complet' nom={liste[mediaSelec].name} id={liste[mediaSelec].id} />}
        </div>
    )
}

export default VueMedia