import '../styles/menu.css'
import { fetch_get, fetch_json } from '../modules/com'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changePrinc, changeDiaporama, changeLoading, changeFavori } from '../store/slices/displaySlice'


function Menu() {
    const dispatch = useDispatch()

    return(
        <div>
            <div>
                <input type='button' value='test' onClick={() => {
                    dispatch(changeLoading())
                    fetch_get('test').then((data) => {
                        console.log(data.message)
                        dispatch(changeLoading())
                    })
                }} />

                <input type='button' value='gestion des tags' onClick={() => {
                    dispatch(changePrinc({panneau: 'gestionTags'}))
                }} />
                <input type='button' value='gestion des sources' onClick={() => {
                    dispatch(changePrinc({panneau: 'sources'}))
                }} />
                <input type='button' value='gallerie' onClick={() => {
                    dispatch(changePrinc({panneau: 'gallerie'}))
                }} />
                <input type='button' value='diaporama' onClick={() => {
                    dispatch(changeDiaporama())
                }} />
                <input type='button' value='sélectionner un favori court' onClick={() => {
                    fetch_json({}, 'post', 'media/favori/court').then(rep => {
                        if (rep) {
                            dispatch(changeFavori(rep))
                        }
                    })
                }} />
                <input type='button' value='sélectionner un favori' onClick={() => {
                    fetch_json({}, 'post', 'media/favori').then(rep => {
                        if (rep) {
                            dispatch(changeFavori(rep))
                        }
                    })
                }} />
            </div>
        </div>
    )
}

export default Menu