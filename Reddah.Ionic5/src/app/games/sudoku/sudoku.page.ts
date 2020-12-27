import { Component, OnInit, Input, ViewChild, Renderer2, Inject, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as $ from 'jquery';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-sudoku',
    templateUrl: './sudoku.page.html',
    styleUrls: ['./sudoku.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class GameSudokuPage implements OnInit{

    constructor(
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document: Document,
        private modalController: ModalController,
    ) {}
    
    ngOnInit(){
      
    }

    ionViewDidLeave() { 
        clearInterval(this.timerHook);
    }

    ionViewDidEnter(){
        console.time("loading time");

        this.initLevels();

        //game  
        this.Sudoku();

        this.run();

        $('#sidebar-toggle').on('click', (e)=> {
            $('#sudoku_menu').toggleClass("open-sidebar");
        });

        //restart game
        $('#' + this.id + ' .restart').on('click', (e)=> {
            this.init();
            this.run();
        });

        $('#sudoku_menu .restart').on('click', (e)=> {
            this.init();
            this.run();
            $('#sudoku_menu').removeClass('open-sidebar');
        });

        console.timeEnd("loading time");

    }

    INIT = 0;
    RUNNING = 1;
    END = 2;

    id = 'sudoku_container';
    displaySolution = 0;
    displaySolutionOnly = 0;
    displayTitle = 1;
    highlight = 1;
    fixCellsNr = 32;
    n = 3;
    nn = this.n * this.n;
    cellsNr = this.nn * this.nn;

    timerHook;

    Sudoku(){
      if (this.fixCellsNr < 10) this.fixCellsNr = 10;
      if (this.fixCellsNr > 70) this.fixCellsNr = 70;

      this.init();

      this.timerHook = setInterval(()=> {
        if (this.status === this.RUNNING) {
            this.secondsElapsed++;
            $('.time').text(this.fix(parseInt(""+this.secondsElapsed/60),2) + ':' + this.fix(this.secondsElapsed%60,2));
        }
      }, 1000);
    }

    

    status = this.INIT;
    cellsComplete = 0;
    board = [];
    boardSolution = [];
    cell = null;
    markNotes = false;
    secondsElapsed = 0;

    init() {
        this.status = this.INIT;
        this.cellsComplete = 0;
        this.board = [];
        this.boardSolution = [];
        this.cell = null;
        this.markNotes = false;
        this.secondsElapsed = 0;
    
        if (this.displayTitle == 0) {
            $('#sudoku_title').hide();
        }
    
        this.board = this.boardGenerator(this.n, this.fixCellsNr);
    };

    boardGenerator(n, fixCellsNr) {
      var matrix_fields = [],
          index = 0,
          i = 0,
          j = 0,
          j_start = 0,
          j_stop = 0;
  
      //generate solution
      this.boardSolution = [];
  
      //shuffle matrix indexes
      for (i = 0; i < this.nn; i++) {
          matrix_fields[i] = i + 1;
      }
  
      //shuffle sudoku 'collors'
      matrix_fields = this.shuffle(matrix_fields);
      for (i = 0; i < n * n; i++) {
          for (j = 0; j < n * n; j++) {
              var value = Math.floor((i * n + i / n + j) % (n * n) + 1);
              this.boardSolution[index] = value;
              index++;
          }
      }
  
      //shuffle sudokus indexes of bands on horizontal and vertical
      var blank_indexes = [];
      for (i = 0; i < this.n; i++) {
          blank_indexes[i] = i + 1;
      }
  
      //shuffle sudokus bands horizontal
      var bands_horizontal_indexes = this.shuffle(blank_indexes);
      var board_solution_tmp = [];
      index = 0;
      for (i = 0; i < bands_horizontal_indexes.length; i++) {
          j_start = (bands_horizontal_indexes[i] - 1) * this.n * this.nn;
          j_stop = bands_horizontal_indexes[i] * this.n * this.nn;
  
          for (j = j_start; j < j_stop; j++) {
              board_solution_tmp[index] = this.boardSolution[j];
              index++;
          }
      }
      this.boardSolution = board_solution_tmp;
  
  
      //shuffle sudokus bands vertical
      var bands_vertical_indexes = this.shuffle(blank_indexes);
      board_solution_tmp = [];
      index = 0;
      for (let k = 0; k < this.nn; k++) {
          for (i = 0; i < this.n; i++) {
              j_start = (bands_vertical_indexes[i] - 1) * this.n;
              j_stop = bands_vertical_indexes[i] * this.n;
  
              for (j = j_start; j < j_stop; j++) {
                  board_solution_tmp[index] = this.boardSolution[j + (k * this.nn)];
                  index++;
              }
          }
      }
      this.boardSolution = board_solution_tmp;
  
      //shuffle sudokus lines on each bands horizontal
      //TO DO
  
      //shuffle sudokus columns on each bands vertical
      //TO DO
  
      //board init
      var board_indexes = [],
          board_init = [];
  
      //shuffle board indexes and cut empty cells    
      for (i = 0; i < this.boardSolution.length; i++) {
          board_indexes[i] = i;
          board_init[i] = 0;
      }
  
      board_indexes = this.shuffle(board_indexes);
      board_indexes = board_indexes.slice(0, this.fixCellsNr);
  
      //build the init board    
      for (i = 0; i < board_indexes.length; i++) {
          board_init[board_indexes[i]] = this.boardSolution[board_indexes[i]];
          if (parseInt(board_init[board_indexes[i]]) > 0) {
              this.cellsComplete++;
          }
      }
  
      this.boardSolution = this.currentSolution;
      board_init = this.currentDisplay;
  
      return (this.displaySolutionOnly) ? this.boardSolution : board_init;
  }

  shuffle(array) {
      var currentIndex = array.length,
        temporaryValue = 0,
        randomIndex = 0;

      while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return array;
  }

  run() {
      this.status = this.RUNNING;

      this.drawBoard();

      //click on board cell
      $('#' + this.id + ' .sudoku_board .cell').on('click', (e)=> {
          let t = e.target;
          if(e.target.tagName=="SPAN"){
            t = e.target.parentElement;
          }
          this.cellSelect(t);
      });

      //click on console num
      $('#' + this.id + ' .board_console .num').on('click', (e)=> {
          var t = e.target,
              value = $.isNumeric($(t).text()) ? parseInt($(t).text()) : 0,
              clickMarkNotes = $(t).hasClass('note'),
              clickRemove = $(t).hasClass('remove'),
              numSelected = $(t).hasClass('selected');

          if (clickMarkNotes) {
              this.markNotes = !this.markNotes;

              if (this.markNotes) {
                  $(t).addClass('selected');
              } else {
                  $(t).removeClass('selected');
                  this.removeNote(0);
                  this.showConsole();
              }

          } else {
              if (this.markNotes) {
                  if (!numSelected) {
                      if (!value) {
                        this.removeNote(0);
                        this.hideConsole();
                      } else {
                        this.addValue(0);
                        this.addNote(value);
                        this.hideConsole();
                      }
                  } else {
                    this.removeNote(value);
                    this.hideConsole();
                  }
              } else {
                this.removeNote(0);
                this.addValue(value);
                this.hideConsole();
              }
          }
      });

      //click outer console
      $('#' + this.id + ' .board_console_container').on('click', (e)=> {
          if ($(e.target).is('.board_console_container')) {
              $(e.target).hide();
          }
      });

      $(window).resize(()=> {
        this.resizeWindow();
      });
  }

  drawBoard() {
      var index = 0,
          position = {
              x: 0,
              y: 0
          },
          group_position = {
              x: 0,
              y: 0
          };

      var sudoku_board = $('<div></div>').addClass('sudoku_board');
      var sudoku_statistics = $('<div></div>')
          .addClass('statistics')
          .html('<b>Cells:</b> <span class="cells_complete">' + this.cellsComplete + '/' + this.cellsNr + '</span>'
          +' <b>Time:</b> <span class="time">' + this.fix(this.secondsElapsed/60,2) + ':' + this.fix(this.secondsElapsed%60,2) + '</span>');

      $('#' + this.id).empty();

      //draw board 
      for (let i = 0; i < this.nn; i++) {
          for (let j = 0; j < this.nn; j++) {
              position = {
                  x: i + 1,
                  y: j + 1
              };
              group_position = {
                  x: Math.floor((position.x - 1) / this.n),
                  y: Math.floor((position.y - 1) / this.n)
              };

              var value = (this.board[index] > 0 ? this.board[index] : ''),
                  value_solution = (this.boardSolution[index] > 0 ? this.boardSolution[index] : ''),
                  cell = $('<div></div>')
                  .addClass('cell')
                  .attr('x', position.x)
                  .attr('y', position.y)
                  .attr('gr', group_position.x + '' + group_position.y)
                  .html('<span>' + value + '</span>');

              if (this.displaySolution) {
                  $('<span class="solution">(' + value_solution + ')</span>').appendTo(cell);
              }

              if (value > 0) {
                  cell.addClass('fix');
              }

              if (position.x % this.n === 0 && position.x != this.nn) {
                  cell.addClass('border_h');
              }

              if (position.y % this.n === 0 && position.y != this.nn) {
                  cell.addClass('border_v');
              }

              cell.appendTo(sudoku_board);
              index++;
          }
      }

      sudoku_board.appendTo('#' + this.id);

      //draw console
      var sudoku_console_cotainer = $('<div></div>').addClass('board_console_container');
      var sudoku_console = $('<div></div>').addClass('board_console');

      for (let i = 1; i <= this.nn; i++) {
          $('<div></div>').addClass('num').text(i).appendTo(sudoku_console);
      }
      $('<div></div>').addClass('num remove').text('X').appendTo(sudoku_console);
      $('<div></div>').addClass('num note').text('?').appendTo(sudoku_console);

      //draw gameover
      var sudoku_gameover = $('<div class="gameover_container"><div class="gameover">Congratulation! <button class="restart">Play Again</button></div></div>');

      //add all to sudoku container
      sudoku_console_cotainer.appendTo('#' + this.id).hide();
      sudoku_console.appendTo(sudoku_console_cotainer);
      sudoku_statistics.appendTo('#' + this.id);
      sudoku_gameover.appendTo('#' + this.id).hide();

      //adjust size
      this.resizeWindow();
  };

  fix(num, length) {
    return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
  }

  resizeWindow() {
    console.time("resizeWindow");

    var screen = {
        w: $(window).width(),
        h: $(window).height()
    };

    //adjust the board
    var b_pos = $('#' + this.id + ' .sudoku_board').offset(),
        b_dim = {
            w: $('#' + this.id + ' .sudoku_board').width(),
            h: $('#' + this.id + ' .sudoku_board').height()
        },
        s_dim = {
            w: $('#' + this.id + ' .statistics').width(),
            h: $('#' + this.id + ' .statistics').height()
        };

    var screen_wr = screen.w + s_dim.h + b_pos.top + 10;

    if (screen_wr > screen.h) {
        $('#' + this.id + ' .sudoku_board').css('width', (screen.h - b_pos.top - s_dim.h - 14));
        $('#' + this.id + ' .board_console').css('width', (b_dim.h / 2));
    } else {
        $('#' + this.id + ' .sudoku_board').css('width', '98%');
        $('#' + this.id + ' .board_console').css('width', '50%');
    }

    var cell_width = $('#' + this.id + ' .sudoku_board .cell:first').width(),
        note_with = Math.floor(cell_width / 2) - 1;

    $('#' + this.id + ' .sudoku_board .cell').height(cell_width);
    $('#' + this.id + ' .sudoku_board .cell span').css('line-height', cell_width + 'px');
    $('#' + this.id + ' .sudoku_board .cell .note').css({
        'line-height': note_with + 'px',
        'width': note_with,
        'height': note_with
    });

    //adjust the console
    var console_cell_width = $('#' + this.id + ' .board_console .num:first').width();
    $('#' + this.id + ' .board_console .num').css('height', console_cell_width);
    $('#' + this.id + ' .board_console .num').css('line-height', console_cell_width + 'px');

    //adjust console
    b_dim = {
        w: $('#' + this.id + ' .sudoku_board').width(),
        h: $('#' + this.id + ' .sudoku_board').width()
    };
    b_pos = $('#' + this.id + ' .sudoku_board').offset();
    let c_dim = {
        w: $('#' + this.id + ' .board_console').width(),
        h: $('#' + this.id + ' .board_console').height()
    };

    var c_pos_new = {
        left: (b_dim.w / 2 - c_dim.w / 2 + b_pos.left),
        top: (b_dim.h / 2 - c_dim.h / 2 + b_pos.top)
    };
    $('#' + this.id + ' .board_console').css({
        'left': c_pos_new.left,
        'top': c_pos_new.top
    });

    //adjust the gameover container
    var gameover_pos_new = {
        left: (screen.w / 20),
        top: (screen.w / 20 + b_pos.top)
    };

    $('#' + this.id + ' .gameover').css({
        'left': gameover_pos_new.left,
        'top': gameover_pos_new.top
    });

    console.log('screen', screen);
    console.timeEnd("resizeWindow");
};

cellSelect(cell) {
  this.cell = cell;

  var value = $(cell).text() | 0,
      position = {
          x: $(cell).attr('x'),
          y: $(cell).attr('y')
      },
      group_position = {
          x: Math.floor((position.x - 1) / 3),
          y: Math.floor((position.y - 1) / 3)
      },
      horizontal_cells = $('#' + this.id + ' .sudoku_board .cell[x="' + position.x + '"]'),
      vertical_cells = $('#' + this.id + ' .sudoku_board .cell[y="' + position.y + '"]'),
      group_cells = $('#' + this.id + ' .sudoku_board .cell[gr="' + group_position.x + '' + group_position.y + '"]'),
      same_value_cells = $('#' + this.id + ' .sudoku_board .cell span:contains(' + value + ')');

  //remove all other selections
  $('#' + this.id + ' .sudoku_board .cell').removeClass('selected current group');
  $('#' + this.id + ' .sudoku_board .cell span').removeClass('samevalue');
  //select current cell
  $(cell).addClass('selected current');

  //highlight select cells
  if (this.highlight > 0) {
      horizontal_cells.addClass('selected');
      vertical_cells.addClass('selected');
      group_cells.addClass('selected group');
      same_value_cells.not($(cell).find('span')).addClass('samevalue');
  }

  if ($(this.cell).hasClass('fix')) {
      $('#' + this.id + ' .board_console .num').addClass('no');
  } else {
      $('#' + this.id + ' .board_console .num').removeClass('no');

      this.showConsole();
      this.resizeWindow();
  }
};

showConsole() {
  $('#' + this.id + ' .board_console_container').show();

  var
      oldNotes = $(this.cell).find('.note');

  //init
  $('#' + this.id + ' .board_console .num').removeClass('selected');

  //mark buttons
  if (this.markNotes) {
      //select markNote button  
      $('#' + this.id + ' .board_console .num.note').addClass('selected');

      //select buttons
      $.each(oldNotes, ()=> {
          var noteNum = $(this.cell).text();
          $('#' + this.id + ' .board_console .num:contains(' + noteNum + ')').addClass('selected');
      });
  }

  return this;
};

removeNote(value) {
  if (value === 0) {
      $(this.cell).find('.note').remove();
  } else {
      $(this.cell).find('.note:contains(' + value + ')').remove();
  }

  return this;
};

addValue(value) {
  console.log('prepare for addValue', value);

  var
      position = {
          x: $(this.cell).attr('x'),
          y: $(this.cell).attr('y')
      },
      group_position = {
          x: Math.floor((position.x - 1) / 3),
          y: Math.floor((position.y - 1) / 3)
      },

      horizontal_cells = '#' + this.id + ' .sudoku_board .cell[x="' + position.x + '"]',
      vertical_cells = '#' + this.id + ' .sudoku_board .cell[y="' + position.y + '"]',
      group_cells = '#' + this.id + ' .sudoku_board .cell[gr="' + group_position.x + '' + group_position.y + '"]',

      horizontal_cells_exists = $(horizontal_cells + ' span:contains(' + value + ')'),
      vertical_cells_exists = $(vertical_cells + ' span:contains(' + value + ')'),
      group_cells_exists = $(group_cells + ' span:contains(' + value + ')'),

      horizontal_notes = horizontal_cells + ' .note:contains(' + value + ')',
      vertical_notes = vertical_cells + ' .note:contains(' + value + ')',
      group_notes = group_cells + ' .note:contains(' + value + ')',

      old_value = parseInt($(this.cell).not('.notvalid').text()) || 0;


  if ($(this.cell).hasClass('fix')) {
      return;
  }

  //delete value or write it in cell
  $(this.cell).find('span').text((value === 0) ? '' : value);

  if (this.cell !== null && (horizontal_cells_exists.length || vertical_cells_exists.length || group_cells_exists.length)) {
      if (old_value !== value) {
          $(this.cell).addClass('notvalid');
          console.log('not valid')
      } else {
          $(this.cell).find('span').text('');
          console.log('set empty')
      }
  } else {
      //add value
      $(this.cell).removeClass('notvalid');
      console.log('Value added ', value);

      //remove all notes from current cell,  line column and group
      $(horizontal_notes).remove();
      $(vertical_notes).remove();
      $(group_notes).remove();
  }

  //recalculate completed cells
  this.cellsComplete = $('#' + this.id + ' .sudoku_board .cell:not(.notvalid) span:not(:empty)').length;
  console.log('is game over? ', this.cellsComplete, this.cellsNr, (this.cellsComplete === this.cellsNr));
  //game over
  if (this.cellsComplete === this.cellsNr) {
      this.gameOver();
  }

  $('#' + this.id + ' .statistics .cells_complete').text('' + this.cellsComplete + '/' + this.cellsNr);

  return this;
};

gameOver() {
  console.log('GAME OVER!');
  this.status = this.END;

  $('#' + this.id + ' .gameover_container').show();
};

hideConsole() {
  $('#' + this.id + ' .board_console_container').hide();
  return this;
};

addNote(value) {
  console.log('addNote', value);

  var
      oldNotes = $(this.cell).find('.note'),
      note_width = Math.floor($(this.cell).width() / 2);

  //add note to cell
  if (oldNotes.length < 4) {
      $('<div></div>')
          .addClass('note')
          .css({
              'line-height': note_width + 'px',
              'height': note_width - 1,
              'width': note_width - 1
          })
          .text(value)
          .appendTo(this.cell);
  }

  return this;
};
  
close(){
    this.modalController.dismiss();
} 


/***menu below */

currentSolution;
currentDisplay; 


levelList;
levelsElem;
levels;
levelPres = [
    {
        id:'0',blurb:'Tutorial',
        solution:[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9], 
        display:[8, 9, 1, 5, 6, 7, 0, 3, 4, 2, 3, 0, 0, 9, 1, 5, 6, 0, 5, 6, 7, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 7, 0, 0, 0, 0, 3, 0, 5, 9, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9, 1, 2, 0, 0, 0, 4, 0, 6, 0, 0, 0, 1, 2, 3, 0, 8, 0, 0, 5, 0, 4, 5, 6, 0, 0, 0, 0, 0, 0],
    },
    {
        id:'1',blurb:'*',
        solution:[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9], 
        display:[8, 0, 1, 5, 6, 7, 0, 0, 0, 2, 3, 0, 0, 0, 0, 5, 6, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 7, 0, 0, 0, 0, 3, 0, 5, 9, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9, 1, 2, 0, 0, 0, 4, 0, 6, 0, 0, 0, 1, 2, 3, 0, 8, 0, 0, 5, 0, 4, 5, 6, 0, 0, 0, 0, 0, 0],
    },
    {
        id:'2',blurb:'**',
        solution:[8, 9, 1, 5, 6, 7, 2, 3, 4, 2, 3, 4, 8, 9, 1, 5, 6, 7, 5, 6, 7, 2, 3, 4, 8, 9, 1, 9, 1, 2, 6, 7, 8, 3, 4, 5, 3, 4, 5, 9, 1, 2, 6, 7, 8, 6, 7, 8, 3, 4, 5, 9, 1, 2, 7, 8, 9, 4, 5, 6, 1, 2, 3, 1, 2, 3, 7, 8, 9, 4, 5, 6, 4, 5, 6, 1, 2, 3, 7, 8, 9], 
        display:[8, 9, 1, 5, 6, 7, 0, 0, 0, 2, 3, 0, 0, 0, 0, 5, 6, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 7, 0, 0, 0, 0, 3, 0, 5, 9, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 9, 1, 2, 0, 0, 0, 4, 0, 6, 0, 0, 0, 1, 2, 3, 0, 8, 0, 0, 5, 0, 4, 5, 6, 0, 0, 0, 0, 0, 0],
    },
];

initLevels(){

    if(this.currentSolution==null)
        this.currentSolution = this.levelPres[0].solution;
    if(this.currentDisplay==null)
        this.currentDisplay = this.levelPres[0].display;

    this.levelList = document.querySelector('.level-list');
    this.levelsElem = document.querySelector('.levels');
    this.levels = [];

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < this.levelPres.length; i++) {
        var pre = this.levelPres[i];
        var listItem = document.createElement('li');
        listItem.className = 'level-list__item';
        let id = pre['id'];
        let solution = pre['solution'];
        let display = pre['display'];
        listItem.innerHTML = '<span class="level-list__item__number">' + (i + 1) +
            '</span> <span class="level-list__item__blurb">' +
            pre['blurb'] + '</span>' +
            '<span class="level-list__item__check">✔</span>';
        listItem.setAttribute('data-id', id);
        listItem.setAttribute('data-solution', solution+"");
        listItem.setAttribute('data-display', display+"");
        fragment.appendChild(listItem);
        this.levels.push(id);
    }

    this.levelList.appendChild(fragment);
}

levelSelect(){
    this.levelList.classList.add('is-open');
}

levelListSelect(){
    var item = this.getParent(event.target, '.level-list__item');
    if (!item) {
        return;
    }
    // load level from id
    var id = item.getAttribute('data-id');
    this.loadLevel(id);
}

getParent(elem, selector) {
    var parent = elem;
    while (parent != document.body) {
        if (parent.matches(selector)) {
            return parent;
        }
        parent = parent.parentNode;
    }
}

loadLevel(id) {
    //var pre = this.levelsElem.querySelector('#' + id);
    console.log(this.levelPres[id])
    //maze = new Maze();
    //maze.id = id;
    // load maze level from pre text
    //maze.loadText(pre.textContent);
    // close ui
    this.levelList.classList.remove('is-open');
    
    window.scrollTo(0, 0);
    // highlight list
    var previousItem = this.levelList.querySelector('.is-playing');
    if (previousItem) {
        previousItem.classList.remove('is-playing');
    }
    this.levelList.querySelector('[data-id="' + id + '"]').classList.add('is-playing');
    localStorage.setItem('currentLevel', id);

    this.currentSolution = this.levelPres[id].solution;
    this.currentDisplay = this.levelPres[id].display;

    //restart
    this.init();
    this.run();
}



}
