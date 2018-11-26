$(document).ready(function () {

  // Variables declaradas con const, se supone nunca cambian.
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
  const NAME_REQUIRED_ERROR = 'UPSS...El nombre es requerido.';
  const gameHeader = $('.game-header');
  const gameBoard = $('#game-board');
  const mainContent = $('.main-content');
  const wrapper = $('.wrapper-start');
  const tryCountContainer = $('#try-count-container');
  const endModal = $('#myModal');
  const startGameButton = $('.button-difficulty button');

  // Variables "globales", son modificadas dinámicamente en varios estadíos del juego
  let maxTries;
  let currentTryCount = 0;
  let playerName;
  let gameDifficulty = {};

  // Obtiene el ranking actual como array, sino devuelve un array vacio
  function getRanking() {
    // Buscamos en el localstorage
    const ranking = localStorage.getItem('memotest-ranking');

    // Si es true, significa que ya guardamos un array antes, transformamos el string de vuelta en array y lo devolvemos
    if (ranking) {
      return JSON.parse(ranking);
    }

    // Si no hay nada, retornamos un array vacio.
    return [];
  }

  // Guarda un objeto con los datos de la partida ganada en el local storage, como un array convertido a json
  function saveToRanking(name, difficulty, tries) {

    // Primero obtenemos el ranking actual (el array con los ganadores, o vacio si nunca nadie jugo aun)
    let ranking = getRanking();

    // Guardamos al ganador en el array
    ranking.push({
      name: name,
      difficulty: difficulty,
      tries: tries,
    });

    // Guardamos en el localstorage como string
    localStorage.setItem('memotest-ranking', JSON.stringify(ranking));
  }

  function validateName(playerName) {
    const error = $(`<div class="error-message-container">
                    <p class="error-message">${NAME_REQUIRED_ERROR}</p>
                  </div>`);

    // Si el nombre esta vacio, hacemos la logica para mostrar mensaje de error
    if (playerName.trim() === '') {

      // Se chequea si ya esta presente el error, para que no se repita varias veces
      if ($('.error-message-container').length === 0) {
        mainContent.append(error);
      } else {
        $('.error-message-container').show();
      }

      // Hacemos que se esconda luego de 3 segundos.
      setTimeout(function () {
        $('.error-message-container').hide();
      }, 3000);

      return false;
    }

    return true;
  }

  // Funcion para mostrar el mensaje de "bienvenida" al juego
  function setWelcomeMessage() {
    const welcome = $(`<p class="welcome">Hola ${playerName}
                        <br/>Encontra todos los pares en menos de <span class="text">${gameDifficulty.maxTries}</span> intentos<br/>Nivel<br/>${gameDifficulty.difficultyName}
                    </p>`);
    gameHeader.append(welcome);
  }


  // Funcion que setea la dificultad. Recibe como paramentro objeto de jQuery (el boton que clickearon)
  function setDifficulty(difficulty) {

    // Obtenemos el id
    const difficultyId = difficulty.attr('id');
    let maxTries = 0;

    // Segundo el id del boton clikeado, seteamos el maximo de intentos.
    switch (difficultyId) {
      case 'easy':
        maxTries = 18;
        break;
      case 'medium':
        maxTries = 12;
        break;
      case 'hard':
        maxTries = 9;
        break;
    }

    // Devolvemos un objeto con el texto (faci, dificil, etc) y la cantidad maxima de intentos segun el nivel de dificultad.
    return {
      difficultyName: difficulty.text(),
      maxTries: maxTries,
    };
  }

  // Esta funcion "dibuja" las cartas
  function drawBoard() {

    // Mezclamos el array
    images.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 12; i++) {
      let hiddenCard = $(`<div data-card-id="${images[i].id}" class="col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3 flipWrapper">
                              <div class="flip-card">
                                <div class="face front">
                                    <img src="img/tapada.jpg"/>
                                </div>
                                <div class="face back">
                                    <img src="${images[i].path}"/>
                                </div>
                              </div>
                            </div>`);

      gameBoard.append(hiddenCard);
    }

    // Ponemos en el dom un cuadro que indica la cantidad de cantidad de intentos que el jugador lleva acumulados.
    const tries = $(
      `<div class="col-md-10 offset-md-1"><p>Intentos: <span class="current-try-count">${currentTryCount}</span></p></div>`);
    tryCountContainer.append(tries);
  }

  // Esta funcion maneja que ocurre cuando el jugador gana o pierde. Recibe como parametro "WON" o "LOST" (las constantes declaradas al principio).
  function endGameModal(gameResult) {

    // Seleccionamos el modal con jquery
    const modalTitle = endModal.find('.modal-title');


    switch (gameResult) {
      // Si gano, lo guardamos en el ranking y ponemos mensaje de ganador
      case WON:
        saveToRanking(playerName, gameDifficulty.difficultyName,
          currentTryCount);
        modalTitle.append(
          $(`<span>GANASTE <img class="icon" src="img/confetti.png ">! con ${currentTryCount} intentos</span>`));
        break;
      case LOST:
        // Si pierde no guardamos nada, mostramos mensaje que perdio
        modalTitle.append(
          $(`<span>Perdiste <img class="icon" src="img/sad.png ">! con ${currentTryCount} intentos</span>`));
        break;
    }

    // Tomamos el ranking actual
    const winners = getRanking();

    // Dibujamos la tabla de ganadores
    const table = $('#ranking');
    for (let i = 0; i < winners.length; i++) {
      let player = winners[i];
      table.append(
        $(`<tr><td>${player.name}</td><td>${player.difficulty}</td><td>${player.tries}</td></tr>`));
    }

    // Mostramos el modal
    endModal.modal('show');
  }

  function handlePlay() {
    // Tomamos el selector de todas las "cartas"
    const cardContainer = $('.flipWrapper');

    // Declaramos variables que se van cambiando en las funciones de abajo
    let clicks = 0; // Cantidad de clicks (se va reiniciando cada dos clicks)
    let carta1 = {}; // "primer" carta
    let carta2 = {}; // "segunda" carta
    // Esta variable es para que no deje hacer nada hasta que se "termine" la jugada.
    // Sino, si uno clikea muy rapido, se quedan cartas dadas vuelta, se rompe todo.
    let playAllowed = true;
    let isFlipped; // Para chequear si una carta ya esta "dada vuelta"
    let imgSrc; // Fuente de la imagen (ruta)
    let id; // Id de la carta

    // Cuando es el primero click, solo guardamos la info de la carta y el selector de la carta(viene por parametro)
    const firstClick = function (clickedCard) {
      carta1 = {
        src: imgSrc,
        id: id,
        selector: clickedCard,
      };
    };

    // En el segundo click, se hacen mas cosas, recibe la carta clickeada como parametro
    const secondClick = function (clickedCard) {
      clicks = 0; // Reiniciamos los clicks a 0
      currentTryCount++; // Subimos el contador de jugadas
      playAllowed = false; // Seteamos false, para que no se pueda jugar hasta que termine de manejarse este segundo click.

      $('.current-try-count').text(currentTryCount);

      carta2 = {
        src: imgSrc,
        id: id,
        selector: clickedCard,
      };

      // Si es igual el id, y la fuente, quiere decir que hay un match
      if (carta1.src === carta2.src && carta1.id !== carta2.id) {

        // Agregamos clase para que no se pueda tocar mas, y ademas se pone en gris
        carta1.selector.addClass('match');
        carta2.selector.addClass('match');
        playAllowed = true; // Se puede seguir "jugando"
      } else {

        // Si no hay match, ponemos un timeout para que se den vuelta de nuevo
        setTimeout(function () {
          carta1.selector.find('.flip-card').removeClass('flip-card-flipped');
          carta2.selector.find('.flip-card').removeClass('flip-card-flipped');

          // Esto es muy imporante, se pone en true RECIEN cuando se "terminó" de dar vuelta la carta
          // Cuando esta funcion corrió, sino, aparecen errores y bugs (porque deja jugar antes de que se den vuelta)
          playAllowed = true;
        }, 500);
      }

      // Chequeamos si gano o perdió, siempre.
      checkEndGame();
    };

    const checkEndGame = function () {

      // Si hay 12 cartas con "match", significa que gano
      if ($('.match').length === 12) {
        endGameModal(WON); // Modal de gano
      } else if (currentTryCount === gameDifficulty.maxTries) {
        // Si la cantidad de intentos es igual a la maxima cantidad de intentos de esta dificultad, perdio
        endGameModal(LOST); // Modal de perdio
      }
    };

    // El evento de click en la carta
    cardContainer.on('click', function () {

      // Tomamos como selector la carta clikeada
      let clickedCard = $(this);

      // Chequeamos si ya esta dada vuelta
      isFlipped = clickedCard.find('.flip-card').hasClass('flip-card-flipped');

      // Si playAllowed esta en false, no puede jugar
      // Si la carta esta con "match", ya esta en gris, no se pueden tocar
      // Si esta dada vuelta, tampoco se puede tocar de nuevo
      if (!playAllowed || ($(this).hasClass('match') || isFlipped)) {
        return false;
      }

      // Si No cumplio ninguna de la condiciones de arriba, seguimos

      // Subimos la cantidad de clicks (empieza en 0).
      clicks++;

      // Ponemos la clase que "da vuelta" la carta, y la muestra
      clickedCard.find('.flip-card').addClass('flip-card-flipped');

      // Tomamos la direcciones de la imagen de la carta y su id
      imgSrc = clickedCard.find('.back').children().attr('src');
      id = clickedCard.data('card-id');


      // Si es el click "1", ejecutamos la funcion del click 1, sino, la del 2 (obviamente seria el segundo si no es el primero)
      // ya que siempre reiniciamos a 0 despues del segundo)
      clicks === 1 ? firstClick(clickedCard) : secondClick(clickedCard);

    });
  }

  function startGame() {

    // funcion que setea el evento del boton de dificultad, para empezar el juego
    startGameButton.on('click', function () {
      playerName = $('#player-name').val();

      // llamamos a la funcion para validar el nombre, si retorna false, no seguimos, no hacemos nada (se muestra el mensaje de error, etc)
      if (!validateName(playerName)) {
        return false;
      }

      // Si el nombre esta bien, seguimos.

      // Escondemos el cuadro de ingresar nombre, dificultad, etc.
      mainContent.hide();

      // Cambiamos la clase del wrapper, para que sea mas ancho cuando jugamos)
      wrapper.removeClass('wrapper-start');
      wrapper.addClass('wrapper-game');


      // Seteamos la dificultad, el this es el boton de dificultad que clickeo el jugador
      gameDifficulty = setDifficulty($(this));

      // Ponemos el mensaje de bienvenida
      setWelcomeMessage();

      // Dibujamos las cartas
      drawBoard();

      // Seteamos el evento de cuando se clikean cartas
      handlePlay();
    });
  }

  // Seteamos el evento (en los botones de dificultad) que empiezan el juego
  startGame();

  // Si se hace click en jugar de nuevo, se recarga la pagina.
  $('#play-again').click(function () {
    window.location.reload();
  });

});