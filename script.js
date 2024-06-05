//---------------------------------------------GLOBAL VARIABLE------------------------------------------------
let currentSong = new Audio()
let currentSelectedSong = null;
let songs;
let lib;
let currentFolder;
//---------------------------------convert seconds to minutes-------------------------------------------------
function SecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60
    const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    return formattedTime
}
// --------------------------------fetch song name from Uploads--------------------------------------------------
async function getSongs(folder) {
    currentFolder = folder
    let songUrl = await fetch(`http://127.0.0.1:3000/uploads/${folder}/`)
    let response = await songUrl.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let arrsong = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            arrsong.push(element.href)
        }
    }
    //--------------------------------update library-------------------------------------------------------
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    let arrsongName = []; // arrsongName will have song names only
    for (const songUrl of arrsong) { // Iterate over the URLs directly
        let fileName = decodeURIComponent(songUrl.split(`/uploads/${currentFolder}/`)[1]);
        arrsongName.push(fileName);
        let li = document.createElement("li");
        li.innerHTML = `<i class="fa-solid fa-music"></i>
        <div class="info">
        <div>${fileName}</div>
        </div>`;
        songUl.appendChild(li);
    }
    //---------------------------------ATTACH EVENT LISTNER TO EACH SONGS-----------------------------------------------
    PlayMusic(arrsongName[0], true)
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML);
            const songNameElement = e.querySelector(".info > div");
            if (currentSelectedSong) {//currentSelectedSong is null then inside of if will not be executed
                currentSelectedSong.style.color = "";
            }
            songNameElement.style.color = "rgb(177 173 173)";
            currentSelectedSong = songNameElement//change currentselectedsong null to songname/something 
        })
    });
    lib = arrsongName;
    return arrsong//array[song url]
}
//-----------------------play songs---------------------------------------
const PlayMusic = (track, pause = false) => {
    currentSong.src = `/uploads/${currentFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "svg/pause.svg"
    }
    document.querySelector(".songName").innerHTML = track
    document.querySelector(".time").innerHTML = "00:00 / 00:00"
}
async function displayAlbum() {
    try {

        let uploadFolder = await fetch(`http://127.0.0.1:3000/uploads/`)
        let response = await uploadFolder.text();
        let div = document.createElement("div")
        let cards = document.querySelector(".cards");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/uploads")) {
                let folderName = e.href.split("/").slice(-2)[0];
// ----------------------------------------------Fetch info.json from the folder----------------------------------------
                let infoJson = await fetch(`http://127.0.0.1:3000/uploads/${folderName}/info.json`);
                let response = await infoJson.json();
// --------------------------------------------------Create a new card element------------------------------------------------
                let newCard = document.createElement("div");
                newCard.classList.add("card1");
                newCard.setAttribute("data-folder", folderName);
                newCard.innerHTML = `
                <div class="play">
                    <div class="play-icon"></div>
                </div>
                <img src="/uploads/${folderName}/cover.jpg" alt="${response.Title}">
                <h3>${response.Title}</h3>
                <p>${response.Description}</p>`;
                cards.appendChild(newCard);
            }
        }
    } catch (error) {
        console.error("Error loading albums:", error);
    }
    
    //-----------------------------------------------populate the card when click-----------------------------------------------------
    Array.from(document.getElementsByClassName("card1")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
        })
    })
}

async function main() {
    await getSongs("CHILL");
//---------------------------------------------------display all the album in page--------------------------------------------------------
    displayAlbum()

    play.addEventListener('click', () => {
//----------------------------------------------------within playmusic funtion------------------------------------------
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svg/play.svg"
        }
    });
//----------------------------------------------------tracking timer duration for songs------------------------------------------------
    currentSong.addEventListener("timeupdate", () => {
        const percentage = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".time").innerHTML = `${SecondsToMinutes(currentSong.currentTime)}/${SecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress").style.width = percentage + "%";
    })
//------------------------------------------------------------seek bar---------------------------------------------------------------
    document.querySelector(".seekbar").addEventListener('click', e => {
        const seekbar = document.querySelector(".seekbar");  
        const circle = document.querySelector(".circle");
        const rect = seekbar.getBoundingClientRect();     
        circle.style.transition = 'none';
        const offsetX = e.clientX - rect.left;       
        const percent = (offsetX / rect.width) * 100; 
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progress").style.width = percent + "%"; 
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        setTimeout(() => {
            circle.style.transition = 'left 0.5s';
        }, 50);
    });
//-------------------------------------------------------menu-----------------------------------------------------------------
    document.querySelector(".menu > img").addEventListener('click', e => {
        document.querySelector(".left").style.left = "0";
        const cross = document.querySelector(".cross");
        cross.style.display = "flex";
    })
//-------------------------------------------------------cross-----------------------------------------------------------------
    document.querySelector("#cross").addEventListener('click', e => {
        const leftElement = document.querySelector(".left");
        leftElement.style.left = "-100%";
    });
//-----------------------------------------------------add previous-----------------------------------------------------------
    document.getElementById("previous").addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src)
        if (index > 0)
            updateSongSelection(index - 1);
        PlayMusic(lib[index - 1])
    })
//-------------------------------------------------------add next-----------------------------------------------------------------
    document.getElementById("next").addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src);
        if (index + 1 < songs.length)
            updateSongSelection(index + 1);
        PlayMusic(lib[index + 1])
    });


}
main()
//---------------------------------------------------TO CHANGE dark and light MODE------------------------------------------------------
function mode() {
    let getbtn = document.querySelector(".switchBtn")
    let img = getbtn.getElementsByTagName("img")[0]
    getbtn.addEventListener('click', () => {
        const currentstate = getbtn.getAttribute("data-state")
        if (currentstate === "night") {
            img.src = "svg/morning.svg"
            img.innerHTML = ""
            getbtn.setAttribute("data-state", "Morning")
        } else {
            img.src = "svg/night.svg"
            getbtn.setAttribute("data-state", "night")
        }
    })
}
mode()
//-------------------------------------------to change color when hit next and previous button--------------------------------------------
function updateSongSelection(index) {
    const songList = document.querySelector(".songList").getElementsByTagName("li");
    if (currentSelectedSong) {
        currentSelectedSong.style.color = "";
    }
    const selectedSong = songList[index].querySelector(".info > div");
    selectedSong.style.color = "rgb(177 173 173)";
    currentSelectedSong = selectedSong;
}
