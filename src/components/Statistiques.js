import { useState, useEffect } from 'react'
import { fetch_get } from '../modules/com'
import '../styles/panneaux.css'
import '../styles/stats.css'

function Barre({part}) {
    // barre de proportion, bornée par sécurité
    return <div className='barreProp'><div style={{width: (Math.max(0, Math.min(1, part))*100).toFixed(1)+'%'}}></div></div>
}

function GraphiqueBarres({donnees, etiquette}) {
    if (donnees.length === 0) return null
    const max = Math.max(...donnees.map(elt => elt.nb))
    const hauteur = 120, largeurBarre = 22, ecart = 10
    const largeur = donnees.length * (largeurBarre + ecart)
    return (
        <svg viewBox={'0 0 '+largeur+' '+(hauteur + 30)} className='graphCroissance'>
            {donnees.map((elt, index) => {
                const h = (elt.nb/max)*hauteur
                const x = index * (largeurBarre + ecart)
                return <g key={elt._id}>
                    <rect x={x} y={hauteur - h} width={largeurBarre} height={h} fill={(elt.hors)?'#3a4048':'#5b8def'} rx='2' />
                    <text x={x + largeurBarre/2} y={hauteur - h - 4} textAnchor='middle' className='valeurMois'>{elt.nb}</text>
                    <text x={x + largeurBarre/2} y={hauteur + 16} textAnchor='middle' className='etiquetteMois'>{etiquette(elt._id)}</text>
                </g>
            })}
        </svg>
    )
}

function Statistiques() {
    const [stats, setStats] = useState(null)
    const [selection, setSelection] = useState(new Set())   //noms des tags choisis
    const [affSelect, setAffSelect] = useState(false)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const tousLesTags = (stats !== null)?stats.tags.flatMap(cat => cat.tags):null
    const [vueCroissance, setVueCroissance] = useState('mois')
    const annees = (stats !== null)?[...new Set(stats.croissance.map(elt => elt._id.slice(0, 4)))].map(Number):[]   //années ayant des données, ordre chronologique (l'agrégat est déjà trié)
    const [anneeSelecBrute, setAnneeSelec] = useState(null)
    const anneeSelec = anneeSelecBrute ?? annees[annees.length-1]   //dernière année tant qu'on n'a pas choisi

    //vue annuelle : fenêtre complète (contexte inclus), mois vides posés à 0
    const moisAnnee = (() => {
        const parMois = new Map(stats.croissance.map(elt => [elt._id, elt.nb]))
        const sortie = []
        const debut = new Date(Date.UTC(anneeSelec, 0, 1))
        debut.setUTCMonth(debut.getUTCMonth() - 4)   //4 mois de contexte avant
        for (let index = 0; index < 20; index++) {    //4 avant + 12 + 4 après
            const annee = debut.getUTCFullYear(), mois = debut.getUTCMonth() + 1
            const cle = annee+'-'+String(mois).padStart(2, '0')
            sortie.push({_id: cle, nb: parMois.get(cle) ?? 0, hors: (annee !== Number(anneeSelec))})
            debut.setUTCMonth(debut.getUTCMonth() + 1)
        }
        return sortie
    })()

    const etiquettesMois = (donnees) => donnees.slice(-18)

    function choisisTag(nom) {
        setSelection(prev => {
            const nouv = new Set(prev)   //d'abord la copie...
            if (nouv.has(nom)) nouv.delete(nom)   //...ensuite la mutation
            else nouv.add(nom)
            return nouv
        })
    }

    useEffect(() => {
        fetch_get('stats').then(rep => { if (rep) setStats(rep) })
    }, [])

    if (stats === null) return null
    return (
        <div className='pageStats'>
            <div className='panneauCarte'>
                <div className='entetePanneau'><span className='titrePanneau'>Volumétrie</span></div>
                <div className='groupes'>
                    {stats.volumetrie.parType.map(elt => <div className='groupe' key={elt._id}>
                        <span className='titreGroupe'>{elt._id}</span>
                        <span>{elt.nb} médias — {elt.favoris} favoris</span>
                        <Barre part={elt.nb/stats.volumetrie.total} />
                    </div>)}
                    <div className='groupe'><span className='titreGroupe'>Total</span>
                        <span>{stats.volumetrie.total} médias dont {stats.volumetrie.favoris} favoris</span></div>
                </div>
            </div>
            <div className='panneauCarte'>
                <div className='entetePanneau'><span className='titrePanneau'>Sources préférées</span></div>
                <div className='groupes'>
                    {stats.sources.map(elt => <div className='ligneStat' key={elt._id}>
                        <span className='nomStat'>{elt._id}</span>
                        <span className='nombreStat'>{elt.favoris}/{elt.nb}</span>
                        <span>favoris</span>
                        <Barre part={(elt.nb > 0)?elt.favoris/elt.nb:0} />
                    </div>)}
                </div>
            </div>
            <div className='panneauCarte'>
                <div className='entetePanneau'>
                    <span className='titrePanneau'>Poids des tags</span>
                    <input type='button' value={(selection.size > 0)?('sélection : '+selection.size+' tag(s)'):'sélectionner des tags'} onClick={() => setAffSelect(!affSelect)} />
                    <input type='button' value='réinitialiser' onClick={() => setSelection(new Set())} className={(selection.size > 0)?'':'none'} />
                </div>
                {(affSelect)?<div className='selectTags'>
                    <div className='menu'>
                        {stats.tags.map((cat, index) => <span key={cat.categorie}
                            className={(categorieSelec === index)?'clicable selec':'clicable'}
                            onClick={() => setCategorieSelec(index)}>{cat.categorie}</span>)}
                    </div>
                    <div className='pilulesTags'>
                        {stats.tags[categorieSelec].tags.map(tag => <span key={tag.nom}
                            className={(selection.has(tag.nom))?'piluleStat choisi':'piluleStat'}
                            onClick={() => choisisTag(tag.nom)}>{tag.nom}</span>)}
                    </div>
                </div>:null}
                {(selection.size > 0)?
                    <div className='groupes'>
                        {tousLesTags.filter(tag => selection.has(tag.nom))
                            .sort((a, b) => b.nombre - a.nombre)
                            .map(tag => {
                                const maxSel = Math.max(...[...selection].map(nom => tousLesTags.find(t => t.nom === nom)?.nombre ?? 0))
                                const choisis = tousLesTags.filter(tag => selection.has(tag.nom))
                                const sommeSel = choisis.reduce((somme, tag) => somme + tag.nombre, 0)
                                return <div className='ligneStat' key={tag.nom}>
                                    <span className='nomStat'>{tag.nom}</span>
                                    <span className='nombreStat'>{(sommeSel > 0)?(tag.nombre/sommeSel*100).toFixed(1):'0.0'}%</span>
                                    <Barre part={(maxSel > 0)?tag.nombre/maxSel:0} />
                                </div>
                            })}
                    </div>
                :
                    <div className='poidsTags'>
                        {stats.tags.map(cat => <div className='groupe' key={cat.categorie}>
                            <span className='titreGroupe'>{cat.categorie} — {cat.nbTags} tags, {cat.somme} usages</span>
                            {cat.tags.slice(0, 15).map(tag => <div className='ligneStat' key={tag.nom}>
                                <span className='nomStat'>{tag.nom}</span>
                                <span className='nombreStat'>{(cat.somme > 0)?(tag.nombre/cat.somme*100).toFixed(1):'0.0'}%</span>
                                <Barre part={(cat.tags[0].nombre > 0)?tag.nombre/cat.tags[0].nombre:0} />
                            </div>)}
                        </div>)}
                    </div>
                }
            </div>
                <div className='panneauCarte'>
                    <div className='entetePanneau'>
                        <span className='titrePanneau'>Croissance</span>
                        {(vueCroissance === 'annee')?
                            <span className='selectAnnees'>
                                {annees.map(an => <span key={an}
                                    className={(an === anneeSelec)?'clicable selec':'clicable'}
                                    onClick={() => setAnneeSelec(an)}>{an}</span>)}
                            </span>:null}
                        <input type='button' value={(vueCroissance === 'mois')?'par année':'par mois'} onClick={() => setVueCroissance((vueCroissance === 'mois')?'annee':'mois')} />
                    </div>
                    {(vueCroissance === 'mois')?
                        <GraphiqueBarres donnees={etiquettesMois(stats.croissance)} etiquette={(id) => id.slice(5)} />
                    :
                        <GraphiqueBarres donnees={moisAnnee} etiquette={(id) => id.slice(5)} />
                    }
                </div>
        </div>
    )
}

export default Statistiques