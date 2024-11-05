const error = document.getElementById("error_container")
const download = document.getElementById("download_container")
const download_button = document.getElementById("download_button")
const download_bar = document.getElementById("download_bar")
const download_bar_progress = document.getElementById("download_bar_progress")


document.addEventListener("DOMContentLoaded", async () => {
    try{
        var capabilities = await ai.languageModel.capabilities();
    }catch{
        error.style.display = "flex"
    }
    capabilities.available == "after-download"
    if(capabilities.available == "readily") window.location.href = "/"
    if (capabilities.available == "after-download")  download.style.display = "flex"
    else error.style.display = "flex"
    
})

download_button.addEventListener("click", async () => {
  download_button.textContent = "Downloading"
  download_bar.style.display = "none"
  download_bar_progress.style.width = "0%"
  download_bar_progress.style.display = "block"
    const session = await ai.assistant.create({
        monitor(m) {
          m.addEventListener("downloadprogress", e => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            download_bar_progress.style.width = `${(e.loaded/e.total)*100}%`
          });
        }
      });
}) 