import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_json } from '../modules/com'
import croix from '../assets/croix.png'
import '../styles/gestionTags.css'
import { initialise } from '../store/slices/listeTagsSlice'


function GestionTags() {
    const dispatch = useDispatch()
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const [tagSelec, setTagSelec] = useState(null)
    const liens = useSelector((state) => state.listeTags.liens)
    const nomTagSelec = (tagSelec !== null)?listeCategoriesTags[categorieSelec].liste[tagSelec]:null
    const liensDuTag = liens[nomTagSelec] ?? []
    const [nomTape, setNomTape] = useState('')
    const tousLesTags = listeCategoriesTags.flatMap(elt => elt.liste)   // toutes catégories confondues

    return (
        <div className='gestionTags'>
            <div className='menu'>
                {listeCategoriesTags.map((elt, index) => <span className={(categorieSelec === index)?'menu clicable selec':'menu clicable'} key={elt.categorie} onClick={() => {
                    setCategorieSelec(index)
                    setTagSelec(null)
                }}>{elt.categorie}</span>)}
            </div>
            <div className='listeTags'>
                {listeCategoriesTags[categorieSelec].liste.map((elt, index) => <div className='case' key={elt}><span className='tag'><input type='radio' name='tag' onClick={() => {
                    setTagSelec(index)
                }} /> {elt}</span></div>)}
            </div>
            <div>
                {(tagSelec !== null)?<div>
                    <input type='text' id='saisie' /><input type='button' value='changer le nom' onClick={() => {
                        const saisie = document.getElementById('saisie')
                        fetch_json({tag: nomTagSelec, nouvTag: saisie.value}, 'put', 'tags/rename').then(rep => {
                            if (rep) {
                                dispatch(initialise(rep.res))
                            }
                            saisie.value = ""
                        })
                    }} /><br/>
                    <label>Déplacer vers </label><select id='listeCategorie'>{listeCategoriesTags.map((elt, index)=> {
                        if (index !== categorieSelec) return <option value={index} key={index}>{elt.categorie}</option>
                    })}</select><input type='button' value='valider' onClick={() => {
                        const selec = document.getElementById('listeCategorie').value
                        fetch_json({categorieCible: listeCategoriesTags[selec].categorie, categorieInit: listeCategoriesTags[categorieSelec].categorie, tag: nomTagSelec}, 'put', 'tags/move').then(rep => {
                            if (rep) {
                                dispatch(initialise(rep.res))
                            }
                        })
                    }} /><br/>
                    <label>Ce tag entraîne : </label>
                    {(liensDuTag.length > 0)?liensDuTag.map(nom => <span className='tag'>{nom}
                        <img src={croix} className='icone clicable inv' onClick={
                            () => fetch_json({source: nomTagSelec, cible: nom}, 'delete', 'tags/lien').then(rep => { if (rep) dispatch(initialise(rep.res))})
                        } />
                    </span>):<span className='note'>aucun</span>}
                    <div className='zoneSaisieLien'>   {/* conteneur relatif = l'ancre */}
                        {(nomTape.trim() !== '')?<div className='suggestionsLien'>
                            {tousLesTags
                                .filter(nom => nom.toLowerCase().startsWith(nomTape.trim().toLowerCase()) && nom !== nomTagSelec)
                                .map(nom => <div className='suggestion' key={nom} onClick={() => setNomTape(nom)}>{nom}</div>)}
                        </div>:null}
                        <input type='text' id='saisieLien' value={nomTape} onChange={(e) => setNomTape(e.target.value)} />
                    </div>
                    <input type='button' value='lier' onClick={() => {
                        fetch_json({source: nomTagSelec, cible: nomTape}, 'post', 'tags/lien').then(rep => { if (rep) { dispatch(initialise(rep.res)); setNomTape('') } })
                    }} />
                </div>:null}
            </div>
        </div>
    )
}

export default GestionTags