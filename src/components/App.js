import { useSelector, useDispatch, } from 'react-redux'
import { useState, useEffect } from 'react'
import Menu from "./Menu"
import Gallerie from "./Gallerie"
import AffProgression from './BarreProgression'
import GestionTags from './GestionTags'
import Comparateur from './Comparateur'
import Diaporama from './Diaporama'
import AffichFavori from './AffichFavori'
import GestionSources from './GestionSources'
import { fetch_get } from '../modules/com'
import { initialise } from '../store/slices/listeTagsSlice'
import '../styles/app.css'
import patienter from '../assets/chronometre.gif'
import { useCookies } from 'react-cookie';

//mettre un "malus" à la priorité des sources qui sont inactives depuis longtemps

//supprimer un tag (susan storm)
//la suppression d'un album n'est pas géré (suppression des fichiers et mise dans la poubelle)
//le diaporama doit prendre les médias les moins utilisés en priorité
//le diaporama ne sélectionne pas que les images, aggregate en question? (peut-être corrigé, à vérifier)
//permettre de passer d'un média à un autre qui se suivent
//améliorer le test qui détermine si un album est déjà dans la BDD (faire une mini de la page de couverture du tome 1?) puis vérifier que le parsage de 8 muses fonctionne en cas d'album déjà présent
//pouvoir supprimer une page d'un album (mais pas l'album complet du coup)
//doit refaire la correction de taille pour les gif/webp lors de l'upload (fait normalement, à tester)
//modifier parseweb pour erofus afin qu'il ajoute directement ce qu'il obtient dans la BDD
//modifier les actions parseweb pour qu'elles ne fassent pas directement appel à mediaBDD

//établir des variables de session/cookie notamment pour y mettre l sinfos de navigations (quand on recharge la page on se retrouve où on est, éventuellement possibilité de s'identifier pourquoi pas et retrouver où on était à la dernière connexion)

//quand l'aperçu de la vidéo s'affiche il peut y avoir un changement de taille de son contenant, il faudrait que la taille soit associée au contenant et non à l'image/vidéo contenue
//voir s'il y a moyen de mettre en aperçu d'une vidéo (quand on passe le curseur dessus) une vidéo raccourcie et/ou de moindre qualité

//à priori il va falloir refaire les images de miniatures des vidéos, du moins si je veux éviter qu'un certain nombre soient des écrans noirs

//comparaison d'image
// 1 mettre en niveau de gris
// 2 faire des images de même taille
// 3 utiliser un hashage sur l'image (perceptual hash(pHash), difference hash(dHash), average hash(aHash))

//la non présence des nouvelles vidéos parmi les anciennes n'est plus testée, donc possibilité qu'il y ait des vidéos en doubles...

//quand on affiche un média à l'écran et qu'il est redimensionné pour correspondre à la taille de la fenêtre il faut mieux tester le redimenssionnement
//  cad tester s'il doit être redim sur la hauteur puis si le rés doit être redim sur la largeur (plutôt que l'un ou l'autre selon que l'image est 
//  un portrait ou un paysage)

function App() {
  const dispatch = useDispatch()
  const progBarDisplay = useSelector((state) => state.display.barreProgression)
  const princDisplay = useSelector((state) => state.display.princ)
  const loading = useSelector((state) => state.display.loading)
  const diaporama = useSelector((state) => state.display.diaporama)
  const favori = useSelector((state) => state.display.favoriSelec)
  const [chargement, setchargement] = useState(true)

  useEffect(() => {
    fetch_get('tags').then(async rep => {
      dispatch(initialise(rep.res))
      setchargement(false)
    })
  }, [])

  if (!chargement)
    return (
      <div className='appli'>
        <Menu id='menu' />
        {(progBarDisplay)?<AffProgression/>:null}
        {(princDisplay.comparateur)?<Comparateur />:null}
        <div className={(princDisplay.gallerie)?null:'none'}><Gallerie /></div>
        <div className={(princDisplay.gestionTags)?null:'none'}><GestionTags /></div>
        <div className={(princDisplay.sources)?null:'none'}><GestionSources /></div>
        <div className={(loading)?'loading':'loading none'} ><img src={patienter} /></div>
        {(diaporama)?<div className='diaporama'><Diaporama working={true} /></div>:<div className='none'><Diaporama working={false} /></div>}
        {(favori !== null)?<div className='favori'><AffichFavori favori={favori} /></div>:null}
      </div>
    )
  else return(<div><span>En chargement</span></div>)
}

export default App