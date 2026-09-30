import { URL_server, PATH_ALBUM } from "../data/config"
import { fetch_json } from '../modules/com'
import { useDispatch, useSelector } from 'react-redux'
import { changePrinc, annuleSelection, selectionneMedia } from "../store/slices/displaySlice"
import boutonRetour from '../assets/flecheHaut.png'
import boutonPrec from '../assets/flecheGauche.png'
import boutonSuiv from '../assets/flecheDroite.png'
import boutonPrecGrise from '../assets/flecheGaucheGrise.png'
import boutonSuivGrise from '../assets/flecheDroiteGrise.png'
import boutonPoubelle from '../assets/poubelle2.png'
import logo from '../assets/bulle.png'
import '../styles/album.css'
import AffichageTagsMedia from "./AffichageTagsMedia"
import { useState, useEffect } from "react"


//props obligatoires
//  - nom: nom de l'album / chemin vers l'image de couverture
//  - display: mini=affichage d'une miniature, complet=affichage détaillé
function Album(props) {
    const dispatch = useDispatch()
    const [tomes, setTomes] = useState([])
    const [tomeSelec, setTomeSelec] = useState(-1)
    const [pageSelec, setPageSelec] = useState(-1)

    //change un nombre dans un integer x en '0000x' sur 5 caractères (il ne faut pas de nombre de plus de 5 digits)
    function formatNomFichier(nombre) {
        const nbChar = nombre.toString().length
        let res = ''
        if (nbChar < 5) {
            for(let index = 0; index < 5 - nbChar; index++)
                res = res+'0'
        }
        res = res + nombre
        return res
    }

    useEffect(() => {
        if (props.display === 'complet') {
            fetch_json({album: props.nom}, 'post', 'album').then(rep => {
                if (rep) {
                    if (rep.res.length === 1) setTomeSelec(0)
                    setTomes(rep.res)
                }
            })
        }
    }, [props])

    if (props.display === 'mini') {
        return(
            <div>
                <div className="conteneurAlbum"><img className="couv" src={URL_server+PATH_ALBUM+props.nom+'/00001/00001.jpg'} /><div className="logo"><img src={logo} /></div></div>
            </div>
        )
    }
    else if (props.display === 'complet') {
        let liste = []
        //on prépare la liste de tout les tomes
        if (tomeSelec === -1) {
            liste = tomes.map((elt, index) => {
                return (<div className="couverture clicable" onClick={() => {
                    setTomeSelec(index)
                }}>
                    <img src={URL_server+PATH_ALBUM+props.nom+'/'+formatNomFichier(index+1)+'/00001.jpg'} />
                    <label>{index+1}</label>
                </div>)
            })
        }
        else {
            //on prépare la liste de toutes les pages d'un tome
            for (let index = 1; index < tomes[tomeSelec]+1; index++) {
                liste.push(<div className="page clicable" onClick={() => {
                    setPageSelec(index)
                }}>
                    <img src={URL_server+PATH_ALBUM+props.nom+'/'+formatNomFichier(tomeSelec+1)+'/'+formatNomFichier(index)+'.jpg'} />
                    <label>{index}</label>
                </div>)
            }
        }
        return(
                <div className="conteneurAlbum">
                    <AffichageTagsMedia media={props.nom} />
                    <div className="album">
                        {((tomeSelec !== -1 && tomes.length>1) || pageSelec !== -1)?<div><input type="button" value='retour' onClick={() => {
                            if (pageSelec !== -1)
                                setPageSelec(-1)
                            else setTomeSelec(-1)
                        }} /></div>:null}
                        {/* on affiche la liste (des tomes ou des pages)*/}
                        {(pageSelec === -1)?<div className="conteneurListe">
                            {liste.map(elt => {
                                return(elt)
                            })}
                        {/* on affiche une page */}
                        </div>:<div className="page clicable" onClick={() => {
                            window.scroll(0,0)
                            if (pageSelec === tomes[tomeSelec]) setPageSelec(1)
                            else setPageSelec(pageSelec+1)
                        }}><img src={URL_server+PATH_ALBUM+props.nom+'/'+formatNomFichier(tomeSelec+1)+'/'+formatNomFichier(pageSelec)+'.jpg'} /></div>}
                    </div>
                </div>
        )
    }
}

export default Album