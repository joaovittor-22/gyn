var win = false;
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

$(document).on('mouseenter', '.single-game-card', function (event) {
    if (this.lastElementChild.children[1].children[0].tagName === "IMG") {
        document.getElementById("farmer-img").setAttribute("src", "assets/images/game/win-img.webp")
        win = true;
    }
}).on('mouseleave', '.single-game-card', function () {
    document.getElementById("farmer-img").setAttribute("src", "assets/images/game/image.webp")
    setTimeout(() => {
        win == true ? resetCards() : null;
    }, 20000)
});
var cards = [{ win: false }, { win: false }, { win: true }]

function createCards() {
    cards = shuffleArray(cards);
    cards.forEach((item) => {
        const div2 = document.getElementById("row-game");
        var backItem = item.win ? "<img height='20px' src= 'assets/images/game/piqui.jpg'></img>" : "<p>Vazio</p>";
        div2.insertAdjacentHTML('beforeend', "<div class='col-md-4 col-sm-6'>" +
            "<div class='single-game-card'>" +
            "<div class='flip-card-inner'>" +
            "<div class='flip-card-front'>" +
            "<p>?</p>" +
            "</div>" +
            "<div class='flip-card-back'>" +
            backItem +
            "</div> </div></div></div>");
    })
}

function resetCards() {
    document.getElementById('row-game').innerHTML = '';
    createCards();
    win = false;
}

createCards()

