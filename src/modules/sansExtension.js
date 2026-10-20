// Nom sans sa DERNIÈRE extension (voir la contrepartie back pour le pourquoi)
export function sansExtension(nom) {
    const point = nom.lastIndexOf('.')
    return (point === -1)?nom:nom.slice(0, point)
}