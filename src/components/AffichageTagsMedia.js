import { fetch_json } from '../modules/com'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { ajouteCategorie, majCategorie } from '../store/slices/listeTagsSlice'
import { setBoucle } from '../store/slices/displaySlice'
import boutonAjout from '../assets/ajout.png'
import '../styles/affichageTagsMedia.css'


//props obligatoires
//  - media: nom du média
function AffichageTagsMedia(props) {
    const dispatch = useDispatch()
    const [saisieCategorie, setSaisieCategorie] = useState(false)
    const listeCategoriesTags = useSelector((state) => state.listeTags.categories)  
    const [saisieTag, setSaisieTag] = useState([])
    const [listeTag, setliststeTag] = useState([])

    function chargeTags() {
        fetch_json({nom: props.media}, 'post', 'media/tags').then(rep => {
            if (rep) {
                setliststeTag(rep.res)
                if (rep.res.find(elt => elt === 'boucle') !== undefined) dispatch(setBoucle(true))
                else dispatch(setBoucle(false))
            }
            else setliststeTag([])
        })
    }

    useEffect(() => {
        chargeTags()
    }, [props])

    //paramètres :
    //  - data est la categorie et ses tags associés
    //  - mode=simple n'affiche que les tags surbrillants, mode=complet affiche tout les tags dont les surbrillants
    //  - la listeTagsSurbrillants peut être vide
    function affCategorieTag(data, mode, listeTagsSurbrillants) {
        return <div className='colonne' key={data.categorie}>
            <div className="ligne">
                <span  className="categorie">{data.categorie}</span>
                {(mode === 'complet')?<img src={boutonAjout} className="icone inv" onClick={() => {
                    let sol = []
                    sol[data.categorie] = !saisieTag[data.categorie]
                    setSaisieTag(sol)
                }}/>:null}                
                {(saisieTag[data.categorie] && mode === 'complet')?<div>
                    <input type="text" id={"saisieTag"+data.categorie} />
                    <input type="button" value='Valider' onClick={() => {
                        let saisie = document.getElementById('saisieTag'+data.categorie)
                        if (saisie.value !== "") fetch_json({nom: saisie.value, categorie: data.categorie}, 'put', 'tags').then(rep => {
                            if (rep) dispatch(majCategorie({categorie: data.categorie, tags: rep.res}))
                            saisie.value = ""
                        })
                    }}  />
                </div>:null}
            </div>
            <div className="tags">
                {data.liste.map((elt) => {
                    const selec = (listeTagsSurbrillants.find((element) => element === elt) !== undefined)?true:false
                    if (mode === 'simple' && selec) {
                        return <span key={elt} className='selec tag'>{elt}</span>
                    }
                    else if (mode === 'complet' && saisieTag[data.categorie]) {
                        return <span key={elt} className={(selec)?'selec tag clicable':'tag clicable'} onClick={() => {
                            if (selec) {
                                fetch_json({tag: elt, media: props.media}, 'delete', 'media/tags').then(rep => {
                                    chargeTags()
                                })
                            }
                            else {
                                fetch_json({tag: elt, media: props.media}, 'put', 'media/tags').then(rep => {
                                    chargeTags()
                                })
                            }
                        }}>{elt}</span>                        
                    }
                })}
            </div>
        </div>
    }

        return(

                    <div className="conteneurTags">
                        <div className="ligne">
                            <h1>Tags</h1>
                            <img src={boutonAjout} className="icone inv" onClick={() => {
                                setSaisieCategorie(!saisieCategorie)
                            }} />
                            {(saisieCategorie)?<div className="ligne"><input type="text" id="saisieCategorie" /><input type="button" value='Valider' onClick={() => {
                                let saisie = document.getElementById('saisieCategorie')
                                if (saisie.value !== "") {
                                    fetch_json({nom: saisie.value}, 'put', 'tags/categorie').then(rep => {
                                        if (rep) dispatch(ajouteCategorie(saisie.value))
                                        saisie.value=""
                                    })
                                }
                            }} /></div>:null}
                        </div>
                        <div className="colonne">
                            {listeCategoriesTags.map((elt) => {
                                if (saisieCategorie) return affCategorieTag(elt, 'complet', listeTag)
                                else {
                                    let verif = false
                                    for (let index = 0; index < listeTag.length && !verif; index++) {
                                        const tag = listeTag[index];
                                        if (elt.liste.find(element => element === tag) !== undefined) verif = true
                                    }
                                    if (verif) return affCategorieTag(elt, 'simple', listeTag)
                                }
                            })}
                        </div>
                    </div>


        )
    
}

export default AffichageTagsMedia