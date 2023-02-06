// Convert image to base64




export default function convertToBase64(file){
    const fileReader =  new FileReader();
    return new Promise((resolve,reject)=>{
       

        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result)
        }

    fileReader.onerror = (error) => {
        reject(error)
    }

    })
           
    }
