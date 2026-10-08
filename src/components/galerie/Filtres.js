import '../../styles/filtres.css'

// Panneau de sélection des filtres d'affichage de la galerie.
// Composant de pure présentation : tout l'état vit dans Galerie.js,
// il ne fait que rendre les props et remonter les interactions.
function Filtres({affiche, setAffiche, filtreSelec, setfiltreSelec, triSelec, setTriSelec,
        triTypeVideo, setTriTypeVideo, triTypeImage, setTriTypeImage, triTypeAlbum, setTriTypeAlbum,
        triFavori, setTriFavori, tagsSelec, setTagsSelec, categorieSelec, setCategorieSelec,
        listeCategoriesTags}) {

    if (!affiche) return null

    return (<div className='zoneFiltre'>
        <div className='enteteFiltre'>
            <span className='titreFiltre'>Filtres d'affichage</span>
            <input type='button' value='effacer les tags' onClick={() => {
                setTagsSelec(listeCategoriesTags.map(elt => {
                    return {categorie: elt.categorie, liste: elt.liste.map(tag => false)}
                }))
                setfiltreSelec('sans')
            }} />
            <input type='button' value='✕ cacher' onClick={() => setAffiche(false)} />
        </div>
        <div className='groupesFiltre'>
            <div className='groupe'>
                <span className='titreGroupe'>Quels médias ?</span>
                <div className='pilules'>
                    <input type='button' className={(filtreSelec === 'avecTag' || filtreSelec === 'filtre')?'pilule actif':'pilule'} value='avec tags' onClick={() => {
                        setfiltreSelec('avecTag')
                    }} />
                    <input type='button' className={(filtreSelec === 'sansTag')?'pilule actif':'pilule'} value='sans tag' onClick={() => {
                        setfiltreSelec('sansTag')
                    }} />
                    <input type='button' className={(filtreSelec === 'nonVu')?'pilule actif':'pilule'} value='jamais vus' onClick={() => {
                        setfiltreSelec('nonVu')
                    }} />
                    <input type='button' className={(filtreSelec === 'sourceInconnue')?'pilule actif':'pilule'} value='source inconnue' onClick={() => {
                        setfiltreSelec('sourceInconnue')
                    }} />
                    <input type='button' className={(filtreSelec === 'sansNote')?'pilule actif':'pilule'} value='sans note' onClick={() => {
                        setfiltreSelec('sansNote')
                    }} />
                    <input type='button' className={(filtreSelec === 'sans')?'pilule actif':'pilule'} value='tous' onClick={() => {
                        setfiltreSelec('sans')
                    }} />
                </div>
            </div>
            <div className='groupe'>
                <span className='titreGroupe'>Tri</span>
                <div className='pilules'>
                    <input type='button' className={(triSelec === 'date')?'pilule actif':'pilule'} value="ordre d'arrivée" onClick={() => {
                        setTriSelec('date')
                    }} />
                    <input type='button' className={(triSelec === 'name')?'pilule actif':'pilule'} value='sans tri' onClick={() => {
                        setTriSelec('name')
                    }} />
                </div>
            </div>
            <div className='groupe'>
                <span className='titreGroupe'>Types</span>
                <div className='pilules'>
                    <input type='button' className={(triTypeVideo)?'pilule actif':'pilule'} value='vidéos' onClick={() => {
                        setTriTypeVideo(!triTypeVideo)
                    }} />
                    <input type='button' className={(triTypeImage)?'pilule actif':'pilule'} value='images' onClick={() => {
                        setTriTypeImage(!triTypeImage)
                    }} />
                    <input type='button' className={(triTypeAlbum)?'pilule actif':'pilule'} value='albums' onClick={() => {
                        setTriTypeAlbum(!triTypeAlbum)
                    }} />
                    <input type='button' className={(triFavori)?'pilule actif':'pilule'} value='favoris' onClick={() => {
                        setTriFavori(!triFavori)
                    }} />
                </div>
            </div>
        </div>
        <div className='catsFiltre'>
            {listeCategoriesTags.map((elt, index) => <span className={(categorieSelec === index)?'clicable selec':'menu clicable'} key={elt.categorie} onClick={() => {
                setCategorieSelec(index)
            }}>{elt.categorie}</span>)}
        </div>
        <div className='listeTags'>
            {listeCategoriesTags[categorieSelec].liste.map((elt, index) => <div className='case' key={elt}><label className={(tagsSelec[categorieSelec].liste[index])?'tag clicable selec':'tag clicable'} onClick={() => {
                let res = [...tagsSelec]
                res[categorieSelec].liste[index] = !res[categorieSelec].liste[index]
                setTagsSelec(res)
                setfiltreSelec('filtre')
            }}>{elt}</label></div>)}
        </div>
    </div>)
}

export default Filtres