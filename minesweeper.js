
// Board object

  function Board(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.bombs = [];
    this.spacesCleared = 0;
    this.gameOver = false;

    for(var row = 1; row <= rows; row++) {
      for(var col = 1; col <= cols; col++) {
        this[String(row) + "," + String(col)] = new Space(row, col);
      };
    };

    this.getSpace = function(row, col) {
      return this[String(row) + "," + String(col)];
    }

    this.clearSpace = function() {
      this.spacesCleared++;

      if(this.spacesCleared === (this.rows * this.cols) - this.bombs.length) {
        for(var i = 0; i < this.bombs.length; i++) {
          var dom_target = 'div[data-row="' + this.bombs[i].row + '"][data-col="' + this.bombs[i].col + '"]';
          $(dom_target).html('<i class="fa fa-smile-o"></i>');
        }
        this.gameOver = true;
        $('#new-game').show();
        $('#feedback').html('<span id="value">0</span><i class="fa fa-bomb"></i>');
      }
    }

    this.blowUp = function() {

      for(var i = 0; i < this.bombs.length; i++) {
        var dom_target = 'div[data-row="' + this.bombs[i].row + '"][data-col="' + this.bombs[i].col + '"]';
        $(dom_target).addClass('bomb');
        $(dom_target).html('<i class="fa fa-bomb"></i>');
      }

      this.gameOver = true;
      $('#new-game').show();
    }
  }

// Space object

  function Space(row, col) {
    this.row = row;
    this.col = col;
    this.bomb = false;

    this.click = function(dom_target) {
      if(!$(dom_target).hasClass('flagged')) {
        if(this.bomb) {

          $(dom_target).addClass('triggered-bomb');
          board.blowUp();

        } else if(!$(dom_target).hasClass('safe')) {

          $(dom_target).addClass('safe');
          board.clearSpace();

          // If 0 bombs, show surrounding spaces
          if(this.numBombsNear() === 0) {
            this.showSpacesAround();
          } else {
            $(dom_target).text(this.numBombsNear());
          }
        }
      }
    }

    this.rightClick = function(dom_target) {
      if($(dom_target).hasClass('flagged')) {

        $(dom_target).removeClass('flagged');
        $(dom_target).empty();
        $('#value').text(parseInt($('#value').text()) + 1);

      } else if(!$(dom_target).hasClass('safe')) {

        $(dom_target).addClass('flagged');
        $(dom_target).html('<i class="fa fa-flag"></i>');
        $('#value').text(parseInt($('#value').text()) - 1);

      }
    }

    this.numBombsNear = function() {
      var numBombs = 0;
      var spacesAround = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

      for(var i = 0; i < spacesAround.length; i++) {
        var spaceToCheck = board.getSpace(this.row + spacesAround[i][0], this.col + spacesAround[i][1]);
        if(spaceToCheck && spaceToCheck.bomb) numBombs++;
      }

      return numBombs;
    }

    this.showSpacesAround = function() {
      var spacesAround = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

      for(var i = 0; i < spacesAround.length; i++) {

        var spaceAround = board.getSpace(this.row + spacesAround[i][0], this.col + spacesAround[i][1]);
        if(spaceAround) var dom_target = 'div[data-row="' + spaceAround.row + '"][data-col="' + spaceAround.col + '"]';

        if(dom_target && !$(dom_target).hasClass('safe')) {

          $(dom_target).addClass('safe');
          $(dom_target).empty();
          board.clearSpace();

          // Recursion
            var numBombsNear = spaceAround.numBombsNear();
            if(numBombsNear === 0) {
              spaceAround.showSpacesAround();
            } else {
              $(dom_target).text(numBombsNear);
            }
        }
      }
    }
  }

// New game function

  function newGame(difficulty) {
    // Clear the board
      $('#board').empty();

    // Determine the board size and number of bombs
      if(difficulty == 'easy') {
        var rows = 6;
        var cols = 8;
        var numBombs = 5;
      } else if (difficulty == 'hard') {
        var rows = 10;
        var cols = 12;
        var numBombs = 30;
      } else {
        var rows = 8;
        var cols = 10;
        var numBombs = 15;
      }

    // Create the board
      board = new Board(rows, cols); // Global

      for(var row = 1; row <= board.rows; row++) {
        for(var col = 1; col <= board.cols; col++) {
          var space = board.getSpace(row, col);
          $('#board').append("<div class='space' data-row='" + space.row + "' data-col='" + space.col + "'>&nbsp;</div>");
        }
        $('#board').append("<br>");
      }

    // Randomly place the bombs
      while(board.bombs.length < numBombs) {
        var rand_row = Math.floor(Math.random() * board.rows) + 1;
        var rand_col = Math.floor(Math.random() * board.cols) + 1;
        var space = board.getSpace(rand_row, rand_col);

        if(space.bomb === false) {
          space.bomb = true;
          board.bombs.push(space);
        }
      }

    // Set the space listeners
      document.oncontextmenu = function() { return false; };

      $('.space').mousedown(function(event) {
        if(!board.gameOver) {
          var space = board.getSpace($(this).attr('data-row'), $(this).attr('data-col'));

          if(event.button === 2) {
            space.rightClick(this);
          } else {
            space.click(this);
          }
        }
      });

    // Set the board and control widths
      $('#board').css('min-width', (cols * 44));
      $('.controls').css('width', (cols * 44) - 2);

    // Set the game feedback
      $('#feedback').html('<span id="value">' + board.bombs.length + '</span><i class="fa fa-bomb"></i>');
      $('#new-game').hide();
  }
