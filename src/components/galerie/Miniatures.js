import '../../styles/miniatures.css'
import Image from '../Image'
import Album from '../Album'
import Video from '../Video'
import { NB_COLONNE_GALLERIE } from "../../data/config"

// Galerie de miniatures : colonnes de médias équilibrées par rapport hauteur/largeur.
// Composant de pure présentation : la liste vient de Galerie.js, le clic est remonté via onSelectMedia.
function Miniatures({liste, onSelectMedia}) {

    function colonnePlusPetite(tailleColonnes) {
        let res = 0
        for (let index = 1; index < tailleColonnes.length; index++) {
            if (tailleColonnes[index] < tailleColonnes[res]) res = index
        }
        return res
    }

    function determineMedia(media, display) {
        switch (media.type) {
            case 'image':
                return(<Image nom={media.name} display={display} />)
            case 'album':
                return(<Album nom={media.name} display={display} />)
            case 'video':
                return(<Video nom={media.name} display={display} />)
            default:
                console.log('type de média inconnu pour afficher '+media.name);
                return null
        }
    }

    //construction des colonnes de médias
    let tailleColonnes = []
    let colonnes = []
    for (let index = 0; index < NB_COLONNE_GALLERIE; index++) {
        tailleColonnes.push(0)
        colonnes.push([])
    }
    liste.map((media, index) => {
        const colonne = colonnePlusPetite(tailleColonnes)
        const rapportTaille = media.taille.height / media.taille.width
        tailleColonnes[colonne] = tailleColonnes[colonne] + rapportTaille
        colonnes[colonne].push(<div className='media' key={media.name} onClick={() => {
            onSelectMedia(index)
        }}>{determineMedia(media, 'mini')}</div>)
    })

    if (colonnes[0].length === 0) return <span>Aucun média dans la liste</span>

    const largeurColonne = Math.floor(100/NB_COLONNE_GALLERIE - 1)+'%'
    return (
        <>
            {colonnes.map((elt, index) => {
                return (<div className='column' id={'col'+index} style={{width: largeurColonne}} key={'col'+index}>
                    {elt}
                </div>)
            })}
        </>
    )
}

export default Miniatures