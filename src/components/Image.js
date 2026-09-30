import { URL_server, PATH_IMAGE } from "../data/config"
import '../styles/image.css'
import AffichageTagsMedia from "./AffichageTagsMedia"


//props obligatoires
//  - nom: nom de l'image
//  - display: mini=affichage d'une miniature, complet=affichage détaillé
function Image(props) {


    if (props.display === 'mini') {
        return(
            <div>
                <div className="conteneurIm"><img src={URL_server+PATH_IMAGE+props.nom} /></div>
            </div>
        )
    }
    else if (props.display === 'complet') {
        return(
                <div className="conteneurImage">
                    <AffichageTagsMedia media={props.nom} />
                    <div className="image"><img src={URL_server+PATH_IMAGE+props.nom} /></div>
                </div>
        )
    }
}

export default Image