import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { fetch_json } from '../modules/com'
import editer from '../assets/editer.png'
import '../styles/gestionTags.css'
import { initialise } from '../store/slices/listeTagsSlice'
import { changeLoading } from '../store/slices/displaySlice'


function GestionTags() {
    const dispatch = useDispatch()
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)
    const [categorieSelec, setCategorieSelec] = useState(0)
    const [tagSelec, setTagSelec] = useState(null)

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
                        fetch_json({tag: listeCategoriesTags[categorieSelec].liste[tagSelec], nouvTag: saisie.value}, 'put', 'tags/rename').then(rep => {
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
                        fetch_json({categorieCible: listeCategoriesTags[selec].categorie, categorieInit: listeCategoriesTags[categorieSelec].categorie, tag: listeCategoriesTags[categorieSelec].liste[tagSelec]}, 'put', 'tags/move').then(rep => {
                            if (rep) {
                                dispatch(initialise(rep.res))
                            }
                        })
                    }} />
                </div>:null}
                {/* <input type='button' value='trier les tags' onClick={() => {
                    dispatch(changeLoading())
                    fetch_json({categorie: listeCategoriesTags[categorieSelec].categorie}, 'put', 'tags/categorie/tri').then(rep => {
                        if (rep)
                            dispatch(initialise(rep.res))
                        dispatch(changeLoading())
                    })
                }} /> */}
            </div>
        </div>
    )
}

export default GestionTags