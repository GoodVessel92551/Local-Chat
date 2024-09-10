const error = document.getElementById("error_container")
const download = document.getElementById("download_container")
const download_button = document.getElementById("download_button")

document.addEventListener("DOMContentLoaded", async () => {
    try{
        var capabilities = await ai.assistant.capabilities();
    }catch{
        error.style.display = "flex"
    }
    capabilities.available == "after-download"
    if(capabilities.available == "readily") window.location.href = "/"
    if (capabilities.available == "after-download")  download.style.display = "flex"
    else error.style.display = "flex"
    load_model()
})

download_button.addEventListener("click", async () => {
    const session = await ai.assistant.create({
        monitor(m) {
          m.addEventListener("downloadprogress", e => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        }
      });
}) 