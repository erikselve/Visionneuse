import { useState } from "react"

// Vignette paresseuse : chargée à l'approche du viewport (loading="lazy"), décodée hors du thread
// principal (decoding="async"), espace réservé par le rapport d'aspect (attributs width/height —
// indispensables au lazy : sans hauteur réservée, tout s'empile en haut et le navigateur charge tout),
// apparition en fondu à l'arrivée — la galerie se remplit image par image.
function Vignette({src, alt, largeur, hauteur, className}) {
    const [chargee, setChargee] = useState(false)
    return <img src={src} alt={alt} className={className}
        loading="lazy" decoding="async"
        width={largeur} height={hauteur}
        style={{opacity: chargee ? 1 : 0, transition: 'opacity 0.3s'}}
        onLoad={() => { setChargee(true) }} />
}

export default Vignette