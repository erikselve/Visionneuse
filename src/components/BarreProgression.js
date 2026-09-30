import { useSelector } from 'react-redux'
import '../styles/barreProgression.css'

function BarreProgression() {
    const indice = useSelector((state) => state.indiceProgression)

    return (
        <div className='panneauProgression'><span>Tâche en cours: {indice.tache}</span><span>Progression: {Math.round(indice.actionsEffectuees*100/indice.objectif)}%</span></div>
    )
}

export default BarreProgression