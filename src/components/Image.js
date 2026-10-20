import { URL_server, PATH_IMAGE } from "../data/config"
import '../styles/image.css'
import AffichageTagsMedia from "./AffichageTagsMedia"
import Vignette from "./Vignette"
import { sansExtension } from "../modules/sansExtension"


//props obligatoires
//  - nom: nom de l'image
//  - display: mini=affichage d'une miniature, complet=affichage détaillé
function Image(props) {


    if (props.display === 'mini') {
        return(
            <div>
                <div className="conteneurIm"><Vignette src={URL_server+PATH_IMAGE+'miniatures/'+sansExtension(props.nomFichier)+'.webp'} largeur={props.taille?.width} hauteur={props.taille?.height} /></div>
            </div>
        )
    }
    else if (props.display === 'complet') {
        return(
                <div className="conteneurImage">
                    <AffichageTagsMedia id={props.id} media={props.nom} />
                    <div className="image"><img src={URL_server+PATH_IMAGE+props.nomFichier} /></div>
                </div>
        )
    }
}

export default Image