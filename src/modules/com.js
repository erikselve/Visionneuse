import { loadImage } from "canvas"
import { URL_server } from "../data/config"

export async function fetch_get(domaine) {
    try {
        // let event = new CustomEvent('debutTelechargement')
        // document.dispatchEvent(event)
        const reponse = await fetch(URL_server+domaine, {
            method: "GET", 
            //body: JSON.stringify({username: elt.username.value, password: elt.password.value }), 
            headers: {'Content-Type': 'application/json'}
        })
        if (!reponse.ok) throw new Error(`HTTP error: ${reponse.status}`)
        const data = await reponse.json()
        // event = new CustomEvent('finTelechargement')
        // document.dispatchEvent(event)
        return data
    }
    catch (error) {
        // document.dispatchEvent(new CustomEvent('finTelechargement'))
        console.error(`Impossible de faire la requête: ${error}`)
        return false
    }
}

export async function fetch_form(form, action) {
    try {
        // let event = new CustomEvent('debutTelechargement')
        // document.dispatchEvent(event)
        const reponse = await fetch(URL_server+action, {
            method: 'POST',
            // headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            enctype: 'multipart/form-data',
            body: form,
        })
        if (!reponse.ok) { 
            if (reponse.status === 300) {
                const data = await reponse.json()
                // const event = new CustomEvent('finTelechargement')
                // document.dispatchEvent(event)
                return data    
            }
            else throw Error('HTTP error: '+reponse.status)
        }
        else {
            const data = await reponse.json()
            // const event = new CustomEvent('finTelechargement')
            // document.dispatchEvent(event)
                return data
        }
    }
    catch (error) {
        console.log('Impossible de faire la requête:'+ error);
        // document.dispatchEvent(new CustomEvent('finTelechargement'))
        return false
    }
}

export async function fetch_json(data, method, action) {
    try {
        // let event = new CustomEvent('debutTelechargement')
        // document.dispatchEvent(event)
        const reponse = await fetch(URL_server+action, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            // enctype: 'multipart/form-data',
            body: JSON.stringify(data),
        })
        if (!reponse.ok) {
            const rep = await reponse.json()
            if (reponse.status === 300) {
                // const event = new CustomEvent('finTelechargement')
                // document.dispatchEvent(event)
                return rep 
            }
            else {
                alert(reponse.message)
                throw Error('HTTP error: '+reponse.status)
            }
        }
        else {
            const rep = await reponse.json()
            // document.dispatchEvent(new CustomEvent('finTelechargement'))
            return rep
        }
    }
    catch (error) {
        console.log('Impossible de faire la requête:'+ error);
        const event = new CustomEvent('finTelechargement')
        document.dispatchEvent(event)
        return false
    }
}