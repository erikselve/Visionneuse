import '../styles/menu.css'
import { fetch_get, fetch_json } from '../modules/com'
import { useDispatch, useSelector } from 'react-redux'
import { changePrinc, changeDiaporama, changeLoading, changeFavori } from '../store/slices/displaySlice'


function Menu() {
    const dispatch = useDispatch()
    const princ = useSelector((state) => state.display.princ)

    function navBouton(libelle, panneau, actif) {
        return(<input type='button' className={(actif)?'navBouton actif':'navBouton'} value={libelle} onClick={() => {
            dispatch(changePrinc({panneau: panneau}))
        }} />)
    }

    return(
        <div className='barreMenu'>
            <span className='titreMenu'>Visionneuse</span>
            {navBouton('Galerie', 'gallerie', princ.gallerie)}
            {navBouton('Diaporama', 'diaporama', princ.diaporama)}
            {navBouton('Tags', 'gestionTags', princ.gestionTags)}
            {navBouton('Sources', 'sources', princ.sources)}
            <div className='actionsMenu'>
                <input type='button' className='actionBouton' value='Favori court' onClick={() => {
                    fetch_json({}, 'post', 'media/favori/court').then(rep => {
                        if (rep) {
                            dispatch(changeFavori(rep))
                        }
                    })
                }} />
                <input type='button' className='actionBouton' value='Favori' onClick={() => {
                    fetch_json({}, 'post', 'media/favori').then(rep => {
                        if (rep) {
                            dispatch(changeFavori(rep))
                        }
                    })
                }} />
                <input type='button' value='test' onClick={() => {
                    dispatch(changeLoading())
                    fetch_get('test').then((data) => {
                        console.log(data.message)
                        dispatch(changeLoading())
                    })
                }} />
            </div>
        </div>
    )
}

export default Menu