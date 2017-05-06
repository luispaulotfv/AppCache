var packageList = [];
var listContainer = document.getElementById("list-container");
var detailContainer = document.getElementById("detail-container");
var helpContainer = document.getElementById("help-container");

startApp();

// start application
function startApp() {
    console.log('Application start.')
    displayBrowserMode();
    getData();
    usedLocalStorage();
};

// display browser mode (online or offline)
function displayBrowserMode() {
    var browserMode = document.getElementById("browser-mode");
    if (navigator.onLine) {
        browserMode.innerHTML = "ONLINE";
        browserMode.classList.remove('text-danger');
        browserMode.classList.add('text-info');
    } else {
        browserMode.innerHTML = "OFFLINE";
        browserMode.classList.remove('text-info');
        browserMode.classList.add('text-danger');
    }
};

// html to display a spinner
function spinnerHtml(id) {
    var myHtml = "";
    myHtml = '<div id="' + "loader" + id + '" class="loader center-block">';
    myHtml += '</div>';
    myHtml += '<br/>';
    return myHtml;
}

// remove s specific spinner
function removeSpinner(id) {
    document.getElementById("loader" + id).classList.remove("loader");
    document.getElementById(id).classList.remove("hidden");
}

// build html for list
function getListHtml() {
    var myHtml = "";
    for (var i = 0; i < packageList.length; i++) {
        var pack = packageList[i];
        myHtml += '<div>';
        myHtml += spinnerHtml(pack.id);
        myHtml += '<img id="' + pack.id + '" src="" alt="' + pack.name + '" class="img-responsive center-block hidden">';
        myHtml += '<h5>' + pack.name + '</h5>';
        myHtml += '<div class="text-warning">' + pack.date + '</div>';
        myHtml += '<br/>';
        myHtml += '<buttom class="btn btn-default btn-block" onclick="clickDetail(' + "'" + pack.id + "'" + ')">Ver detalhes</buttom>';
        myHtml += '</div>';
        myHtml += '<hr/>';
    }
    return myHtml;
};

// display list on page
function displayList(dataOrigin) {
    var myHtml = "";
    clearAllContainers();
    if (packageList && packageList.length > 0) {
        myHtml = getListHtml();
        helpContainer.innerHTML = "Click num destino à sua Escolha para ver os detalhes.";
    } else {
        myHtml = '<h4 class="text-warning">Não foram encontrados registos.</h4>';
    }
    listContainer.innerHTML = myHtml;
    if (dataOrigin == "fromLocal")
        loadImagesFromLocal();
    scrollTop();
};

// build html for detail
function getDetailHtml(pack) {
    var myHtml = "";
    if (pack) {
        myHtml = '<div>'
        myHtml += spinnerHtml(pack.id);
        myHtml += '<img id="' + pack.id + '" src="" alt="' + pack.name + '" class="img-responsive center-block hidden">';
        myHtml += '<hr/>';
        myHtml += '<h4>' + pack.name + '</h4>';
        myHtml += '<div class="text-warning">' + pack.date + '</div>';
        myHtml += '<div><strong>' + pack.id + '</strong></div>';
        myHtml += '<hr/>';
        myHtml += '<div><p>' + pack.description + '</p></div>';
        if (pack.includedServices) {
            myHtml += '<hr/>';
            myHtml += '<h5 class="text-warning">Serviços Incluidos</h5>';
            myHtml += '<div>' + pack.includedServices + '</div><br>'
        }
        myHtml += '<div class="text-danger text-right"><strong>' + Number(pack.price).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' €</strong></div>';
        myHtml += '</div>';
    }
    return myHtml;
}

// display package detail
function displayDetail(pack) {
    var myHtml = "";
    clearAllContainers();
    helpContainer.innerHTML = "Click no botão voltar para a lista para regressar à pagina inicial.";
    if (pack) {
        myHtml = getDetailHtml(pack);
    } else {
        myHtml = '<h4 class="text-warning">Não foi encontrado o registo.</h4>';
    }
    myHtml += '<br/>';
    myHtml += '<buttom class="btn btn-default btn-block" onclick="getData()">Voltar para a lista</buttom>'
    detailContainer.innerHTML = myHtml;
    loadImageFromLocal(pack.id);
    scrollTop();
}

// select data from server or from local storage
function getData() {
    var requestUrl = 'data/data.json';
    if (navigator.onLine) {
        getDataFromServer(requestUrl);
    } else {
        getDataFromLocalStorage();
    }
};

// convert all images in base64 format
function convertImages() {
    if (packageList && packageList.length > 0) {
        [].forEach.call(packageList, convertImage);
    }
}

// convert image in base64 format
function convertImage(pack) {
    var url = document.baseURI + pack.img;
    toDataURL(url, function(dataUrl) {
        saveBase64(pack.id, dataUrl);
    });
}

// save base64 image at application cache
function saveBase64(id, base64Img) {
    for (i= 0; i < packageList.length; i++) {
        if (packageList[i].id == id) {
            packageList[i].base64Img = base64Img;
            saveDataOnLocalStorage();
            removeSpinner(packageList[i].id);
            document.getElementById(packageList[i].id)
                .setAttribute("src", packageList[i].base64Img);
            return;
        }
    }
}

// load base64 image from local storage
function loadImagesFromLocal() {
    if (packageList && packageList.length > 0) {
        for (i= 0; i < packageList.length; i++) {
            removeSpinner(packageList[i].id);
            document.getElementById(packageList[i].id)
                .setAttribute("src", packageList[i].base64Img);
        }
    }
}

// load base64 image from local storage
function loadImageFromLocal(id) {
    for (i= 0; i < packageList.length; i++) {
        if (packageList[i].id == id) {
            removeSpinner(packageList[i].id);
            document.getElementById(packageList[i].id)
                .setAttribute("src", packageList[i].base64Img);
            return;
        }
    }
}

// load data from server
function getDataFromServer(requestUrl) {
    var client = new HttpClient();
    console.log('Get data from server.');
    client.get(requestUrl, function(response) {
        if (response && response.length > 0) {
            packageList = JSON.parse(response);
            convertImages();
            displayList("fromServer");
            console.log('Server response: ', packageList);
        } else {
            console.log('There was no response from the server, it will search the local storage.')
            getDataFromLocalStorage();
        }
    });
};

// get data from local storage
function getDataFromLocalStorage() {
    console.log('Get data from local storage.');
    if (localStorage.localPackageList) {
        packageList = JSON.parse(localStorage.localPackageList);
        console.log('Local storage response: ', packageList);
    } else {
        console.log('Data does not exist in local storage.');
    }
    displayList("fromLocal");
};

// returns the space used in local storage
function usedLocalStorage() {
    document.getElementById("localStorageUsedSpace").innerHTML = formatBytes(byteCount(localStorage.localPackageList));
}

// save data on local storage
function saveDataOnLocalStorage() {
    var packages = JSON.stringify(packageList);
    localStorage.localPackageList = packages;
}

// get a package by id
function getPackage(id) {
    for (i = 0; i < packageList.length; i++) {
        var package = packageList[i];
        if (package.id == id) {
            return package;
        }
    }
};

// a package was ckicked
function clickDetail(id) {
    displayDetail(getPackage(id));
}

// move win to top
function scrollTop() {
    window.scrollTo(0, 0);
};

// clear help container
function clearHelpContainer() {
    helpContainer.innerHTML = "";
};

// clear list container
function clearListContainer() {
    listContainer.innerHTML = "";
};

// clear detail container
function clearDetailContainer() {
    detailContainer.innerHTML = "";
};

// clear all containers
function clearAllContainers() {
    clearHelpContainer();
    clearListContainer();
    clearDetailContainer();
};

// Http client async
function HttpClient() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                    aCallback(anHttpRequest.responseText);
            }
            // set false for synchronous request, synchronous requests are discouraged
            // use true for asynchronous  
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
};

// convert url image in base64 data
function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

// byte size of string
function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

// convert bytes in ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Bytes';
   var k = 1000,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}