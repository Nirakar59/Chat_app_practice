let stream = null 
const constraints = {
    audio: true,
    video: true
}
const getMicAndCamera = async(e)=>{
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        const videoElement = document.getElementById("preview")
        videoElement.srcObject = stream;
    } catch (error) {
        console.log("Error: ", error.message);
        
    }
}

document.querySelector("#share").addEventListener('click', e=>getMicAndCamera(e))