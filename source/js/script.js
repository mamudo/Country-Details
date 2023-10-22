const textSearch = document.querySelector("#textSearch");
const btnSearch = document.querySelector("#btnSearch");
const btnLocation = document.querySelector("#btnLocation");
const countryDetails = document.querySelector("#details");
const neighborCountries = document.querySelector("#neighbors");
const errorAlert = document.querySelector("#alertMessage");

//Type your https://opencagedata.com/ API key here:
const key = "APIKEYHERE";


btnSearch.addEventListener("click",() => {
    let text = textSearch.value;
    getCountry(text);
});

textSearch.addEventListener("keypress", (e) =>{
    if(e.key === 'Enter'){
        btnSearch.click();
    }
});

btnLocation.addEventListener("click", () =>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
});

// Position is getting from: https://opencagedata.com/
async function onSuccess(position){
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    const targetCountry = data.results[0].components.country;
    textSearch.value = targetCountry;
    btnSearch.click();
}
function onError (err){
    console.log(err);
}


async function getCountry(country){
    try {
        const response = await fetch('https://restcountries.com/v3.1/name/' + country);
        if(!response.ok){
            throw new Error("Can't find the country you're looking for");
        }
        const data = await response.json();
        renderCountry(data);

        const countries = data[0].borders;
        if(!countries){
            throw new Error("Not found neighbor country");
        }
        const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
        const neighbors = await response2.json();
        renderNeighbors(neighbors);

    }
    catch (err){
        console.log(err.message);
        renderError(err);
    }
}

function renderCountry(data){
    countryDetails.innerHTML =
    `
            <div class="col-4">
                <img src="${data[0].flags.png}" class="img-fluid">
            </div>
            <div class="col-8 py-2">
                <h3>${data[0].name.common}</h3>
                <hr>
                <div class="row">
                    <div class="col-4">Population: </div>
                    <div class="col-8">${(data[0].population / 1000000).toFixed(1)} M</div>
                </div>
                <div class="row">
                    <div class="col-4">Language: </div>
                    <div class="col-8">${Object.values(data[0].languages)}</div>
                </div>
                <div class="row">
                    <div class="col-4">Capital:  </div>
                    <div class="col-8">${data[0].capital[0]}</div>
                </div>
                <div class="row">
                    <div class="col-4">Currency:  </div>
                    <div class="col-8">TL</div>
                </div>
            </div>`;
    textSearch.value = "";
}
function renderNeighbors(data){
    let html = ``;
    for (let country of data){
        html += `<div class="col-2 mt-2 d-flex">
                            <div class="card mb-2">
                                <img src="${country.flags.png}" class="img-fluid">
                                <div class="card-body d-flex align-items-end">
                                    <h6 class="card-title">${country.name.common}</h6>
                                </div>
                            </div>
                        </div>`;
    }
    neighborCountries.innerHTML = html;
    textSearch.value = "";
}

function renderError(err){
    const html = `<div class="container">
            <div class="row">
                <div class="col-4 mx-auto mt-3">
                    <div class="alert alert-danger text-center">
                        ${err.message}
                    </div>
                </div>
            </div>
        </div>`;
    setTimeout(function (){
        errorAlert.innerHTML = "";
    },3000);
    errorAlert.innerHTML = html;

}