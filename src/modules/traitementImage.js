export async function miniaturise(canvas, fichier) {
    const ctx = canvas.getContext('2d')
    const reader = new FileReader()
    reader.onload = () => {
        const img = new Image()
        img.onload = () => {
            ctx.drawImage(img, 0, 0, img.width, img.height,0,0,10,10)
        }
        img.onerror = err => { throw err }
        img.src = reader.result
    }
    reader.readAsDataURL(fichier)
}

export function identiques(context1, context2) {
    let difference = 0
    let x = 0
    while ((x < 11) && (difference < 15)) {
        let y = 0
        while ((y < 11) && (difference < 15)) {
            let res = true
            const data1 = context1.getImageData(x,y,1,1).data
            const data2 = context2.getImageData(x,y,1,1).data
            // data1.map((elt, index) => {if (elt !== data2[index]) res=false})
            data1.forEach((elt, index) => {
                if (elt !== data2[index]) res=false
            });
            if (!res) difference++
            y++
        }
        x++;
    }
    if (difference < 15) return true
    else return false
}