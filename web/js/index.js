// Script to open and close sidebar
function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
    document.getElementById("myOverlay").style.display = "block";
}

function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("myOverlay").style.display = "none";
}

window.addEventListener("enterElement", function(e) {
    console.log(e.detail);

    var datas = $(e.detail.elements).find("td");

    window.dispatchEvent(new CustomEvent("addTimeLine", {
        detail: {
            name: datas[1].innerText,
            id: datas[0].innerText
        }
    }));
});

window.addEventListener("searchFor", function(e) {
    window.dispatchEvent(new CustomEvent("filterFor", {
        detail: {
            filterText: e.detail.searchText
        }
    }));

});

window.addEventListener("TimeLineChanged", function(e) {
    var tagIds = [];
    $(e.detail.elements).map(function(x, data) { if (data.id != undefined) tagIds.push(data.id) })
    $.ajax({
        url: "./../explorer/" + JSON.stringify(tagIds),
        success: function(d) {
            d = JSON.parse(d);
            window.dispatchEvent(new CustomEvent("showTable", {
                detail: {
                    elements: d
                }
            }));
        },
        error: function() {
            console.log("noooo")
        }
    });
});


$(document).ready(function() {

    window.dispatchEvent(new CustomEvent("addTimeLine", {
        detail: {
            name: "."
        }
    }));
});