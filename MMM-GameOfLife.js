"use strict";

Module.register("MMM-GameOfLife", {

  // Default module config.
  defaults: {
    name: "MMM-GameOfLife",

    desiredFrameRate: 1,
    resolution: 10,
    canvasWidth: 300,
    canvasHeight: 300,
    notAliveColorCode: "#000",
    aliveColorCode: "#aaa"
  },


  getDom: function() {
    let wrapper = document.createElement("div");
    wrapper.id = "gameOfLifeWrapper";

    return wrapper;
  },

  getScripts: function() {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/p5.js",
      this.file("core/game_of_life.js")
    ];
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === "DOM_OBJECTS_CREATED") {
      Log.info("DOM objects are created. Starting P5 …");

      let sketch = this.makeSketch(this.config);
      new p5(sketch, "gameOfLifeWrapper");
    }
  },

  makeSketch: function(conf) {
    return function(pFive) {
      let currentGenGrid;
      let lastGenGrid;

      /* user definable parameters */
      let desiredFrameRate = conf.desiredFrameRate;
      let resolution = conf.resolution;
      let canvasWidth = conf.canvasWidth;
      let canvasHeight = conf.canvasHeight;
      let notAliveColorCode = conf.notAliveColorCode;
      let aliveColorCode = conf.aliveColorCode;

      /* computed parameters */
      let rows = canvasWidth / resolution;
      let cols = canvasHeight / resolution;


      pFive.setup = function() {
        pFive.frameRate(desiredFrameRate);
        let canvas = pFive.createCanvas(canvasWidth, canvasHeight);
        canvas.parent("gameOfLifeWrapper");

        lastGenGrid = makeGrid(rows, cols);
        currentGenGrid = makeGrid(rows, cols);
        fillGridRandomly(currentGenGrid);
      }

      pFive.draw = function() {
        let notAlifeColor = pFive.color(notAliveColorCode);
        pFive.background(notAlifeColor);

        drawGrid(currentGenGrid);
        let nextGenGrid = computeNextGeneration(currentGenGrid);

        if (gridsEqual(nextGenGrid, currentGenGrid) || gridsEqual(nextGenGrid, lastGenGrid)) {
          fillGridRandomly(currentGenGrid);
        } else {
          lastGenGrid = currentGenGrid;
          currentGenGrid = nextGenGrid;
        }
      }


      /*
        "Private functions"
       */

      function makeGrid(rows, cols) {
        let array = new Array(rows);

        for (let i = 0; i < rows; i++) {
          array[i] = new Array(cols);
        }

        return array;
      }


      function fillGridRandomly(grid) {
        for (let i = 0; i < grid.length; i++) {
          for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = pFive.floor(pFive.random(2));
          }
        }
      }


      function drawGrid(grid) {
        for (let i = 0; i < grid.length; i++) {
          for (let j = 0; j < grid[i].length; j++) {
            drawCell(grid, i, j);
          }
        }
      }


      function drawCell(grid, i, j) {
        let aliveColor = pFive.color(aliveColorCode);

        if (grid[i][j] === 1) {
          pFive.fill(aliveColor);
          pFive.stroke(aliveColor);

          let x = i * resolution;
          let y = j * resolution;
          pFive.rect(x, y, resolution - 1, resolution - 1);
        }
      }


      function computeNextGeneration(currentGen) {
        let nextGen = makeGrid(rows, cols);

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            let currentState = currentGen[i][j];
            let aliveNeighbors = countAliveNeighbors(currentGen, i, j);

            if (currentState === 0 && aliveNeighbors === 3) {
              nextGen[i][j] = 1;
            } else if (currentState === 1 && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
              nextGen[i][j] = 0;
            } else {
              nextGen[i][j] = currentState;
            }
          }
        }

        return nextGen;
      }


      function countAliveNeighbors(grid, x, y) {
        let count = 0;

        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            let row = (x + i + rows) % rows;
            let col = (y + j + cols) % cols;

            count += grid[row][col];
          }
        }

        count -= grid[x][y];

        return count;
      }


      function gridsEqual(leftGrid, rightGrid) {
        if (!rightGrid) {
          return false;
        }

        if (leftGrid.length !== rightGrid.length) {
          return false;
        }

        for (let i = 0; i < leftGrid.length; i++) {
          if (leftGrid[i].length !== rightGrid[i].length) {
            return false;
          }

          for (let j = 0; j < leftGrid[i].length; j++) {
            if (leftGrid[i][j] !== rightGrid[i][j]) {
              return false;
            }
          }
        }

        return true;
      }

    };
  }
});