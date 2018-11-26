$(document).ready(function () {

    const WON = 'won';
    const LOST = 'lost';

    const images = [
        { name: "alce", path: "img/alce.jpg", id: 1 },
        { name: "elefante", path: "img/elefante.jpg", id: 2 },
        { name: "nena", path: "img/nena.jpg", id: 3 },
        { name: "peces", path: "img/peces.jpg", id: 4 },
        { name: "unichancho", path: "img/unichancho.jpg", id: 5 },
        { name: "zapas", path: "img/zapas.jpg", id: 6 },
        { name: "alce", path: "img/alce.jpg", id: 7 },
        { name: "elefante", path: "img/elefante.jpg", id: 8 },
        { name: "nena", path: "img/nena.jpg", id: 9 },
        { name: "peces", path: "img/peces.jpg", id: 10 },
        { name: "unichancho", path: "img/unichancho.jpg", id: 11 },
        { name: "zapas", path: "img/zapas.jpg", id: 12 }
    ];
    var gameHeader = $('.game-header');
    var wrapper = $('.wrapper-start');
    var maxTries;
    var currentTryCount = 0;
    var modalReference = $('#myModal');
    var playerName;
    var gameDifficultyText;

    $('.button-difficulty button').on('click', function () {
        playerName = $('#player-name').val();
        var errorMessageContent = $('.main-content');
        var error = $('<div class="error-message-container"><p class="error-message">UPSS...El nombre es requerido.</p></div>');
        if (playerName.trim() === "") {

            if ($('.error-message-container').length === 0) {
                errorMessageContent.append(error);
            } else {
                $('.error-message-container').show();
            }

            setTimeout(function () {
                $('.error-message-container').hide();
            }, 3000);
        } else {
            $('.main-content').hide();

            //wrapper.switchClass('wrapper-start', 'wrapper-game')
            wrapper.removeClass('wrapper-start');
            wrapper.addClass('wrapper-game');



            var difficulty = $(this).attr('id');
            switch (difficulty) {
                case 'easy': maxTries = 18; break;
                case 'medium': maxTries = 12; break;
                case 'hard': maxTries = 9; break;
            }

            gameDifficultyText = $(this).text();


            var welcome = $('<p class="welcome">Hola ' + playerName + '<br/>Encontra todos los pares en menos de <span class="text">'
                + maxTries + '</span> intentos<br/>Nivel<br/>' + gameDifficultyText + '</p>');
            gameHeader.append(welcome);
            board();
        }


        function board() {
            images.sort((a, b) => Math.random() - 0.5);
            for (let i = 0; i < 12; i++) {
                var CardTapada = $('<div data-card-id="' + images[i].id + '" class="col-4 col-lg-3 flipWrapper">' +
                    '<div class="flip-card">' +
                    '<div class="face front">' +
                    '<img src="' + 'img/tapada.jpg' + '"/>' +
                    '</div>' +
                    '<div class="face back">' +
                    '<img src="' + images[i].path + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>');
                var gameBoard = $("#game-board");

                gameBoard.append(CardTapada);
            }

            var tryCountContainer = $("#try-count-container");
            var tries = $('<div class="col-md-10 offset-md-1"><p class="current-try-count">Intentos: ' + currentTryCount + '</p></div>')
            tryCountContainer.append(tries);
        }

        var clicks = 0;
        var carta1 = {};
        var carta2 = {};
        var playAllowed = true;
        $('.flipWrapper').click(function () {

            var isFlipped = $(this).find('.flip-card').hasClass('flip-card-flipped');

            if (!playAllowed || ($(this).hasClass('match') || isFlipped)) {

                return false;
            }

            clicks++;

            $(this).find('.flip-card').addClass('flip-card-flipped');

            const imgSrc = $(this).find('.back').children().attr('src');
            const id = $(this).data('card-id');

            if (clicks == 1) {
                carta1 = {
                    src: imgSrc,
                    id: id,
                    selector: $(this)
                }
            } else {
                playAllowed = false;
                // $(this).find('.card').toggleClass('flip-card-flipped');
                carta2 = {
                    src: imgSrc,
                    id: id,
                    selector: $(this)
                }

                currentTryCount++;
                $('.current-try-count').text('Intentos: ' + currentTryCount);

                if (carta1.src == carta2.src && carta1.id != carta2.id) {
                    carta1.selector.addClass('match');
                    carta2.selector.addClass('match');
                    playAllowed = true;

                } else {
                    console.log('distintos')
                    setTimeout(function () {
                        carta1.selector.find('.flip-card').removeClass('flip-card-flipped');
                        carta2.selector.find('.flip-card').removeClass('flip-card-flipped');
                        playAllowed = true;
                    }, 500);
                }
                clicks = 0;
                if ($('.match').length == 12) {
                    endGameModal(WON);
                } else if (currentTryCount == maxTries) {
                    endGameModal(LOST);

                }

            }

        });

    });



    function endGameModal(gameResult) {
        // GANASTE <span><img class="icon-question-2" src="img/confetti.png "></span>!
        // con;

        const modalTitle = modalReference.find('.modal-title')

        switch (gameResult) {
            case WON:
                saveToRanking(playerName, gameDifficultyText, currentTryCount);
                modalTitle.append($('<span>GANASTE <img class="icon" src="img/confetti.png ">! con ' + currentTryCount + ' intentos</span>'));
                break;
            case LOST:
                modalTitle.append($('<span>Perdiste <img class="icon" src="img/sad.png ">! con ' + currentTryCount + ' intentos</span>'));
                break;
        }
        let winners = getRanking();
        let table = $('#ranking');
        for (let i = 0; i < winners.length; i++) {
            let player = winners[i];
            table.append($(`<tr><td>${player.name}</td><td>${player.difficulty}</td><td>${player.tries}</td></tr>`));
        }


        modalReference.modal('show');
    }

    $('#play-again').click(function () {
        window.location.reload();
    });


});


function getRanking() {

    let ranking = localStorage.getItem('memotest-ranking');

    if (ranking) {
        return JSON.parse(ranking);
    }
    return [];
}

function saveToRanking(name, difficulty, tries) {

    let ranking = getRanking();

    ranking.push({
        name: name,
        difficulty: difficulty,
        tries: tries
    });

    localStorage.setItem('memotest-ranking', JSON.stringify(ranking));
}