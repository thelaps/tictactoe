'use strict';

console.log('ready!');

var TheGame = TheGame || {};
(TheGame = {
    models: { //Aka model oriented object
        polygon: (function(id){
            var _mainLayer = document.getElementById(id); //Just main div, that will be used for initialisation
            return _mainLayer;
        }),
        grid: {
            options: {
                variations: [2, 7, 6, 9, 5, 1, 4, 3, 8], //used magic square https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Magicsquareexample.svg/100px-Magicsquareexample.svg.png
                summary: 15 //also for magic square (total sum)
            },
            build: (function(gamePolygon, infoPolygon, scenario){ //main function for building game
                var _self = this;

                for ( var i in _self.options.variations ) {
                    var _variation = _self.options.variations[i];
                    var _newElement = document.createElement('div');
                    gamePolygon.appendChild(_newElement); //appending each box for game box
                    _newElement.setAttribute('id', _variation);

                    _self.attachListener(_newElement, function(){ //attaching and functionality for click on each box
                        if (scenario.canContinue && scenario.isAllowedToPick(this.getAttribute('id'))) {
                            scenario.applyCurrent(); //just switch of steps
                            this.setAttribute('class', scenario.getRole()); //setting an filled class (cross or nought) for ticked box
                            scenario.setFilled(this.getAttribute('id'), scenario.getRole()); //adding to scenario and ticked values

                            if (scenario.isCompleted(_self.options.summary)) { //checking if completed the game (only win mode)
                                _self.setInfo(scenario, true); //Label of winner
                                return false;
                            }

                            _self.setInfo(scenario, false); //Label of next step
                        }
                        return false;
                    });
                }
                _self.setInfo(scenario, false);
            }),
            attachListener: (function(element, callback){
                if (element.addEventListener) {
                    element.addEventListener('click', callback, false);
                } else {
                    element.attachEvent('onclick', callback);
                }
            }),
            setInfo: (function(scenario, isWinner){
                var ucfirst = function(_str) {
                    var _first = _str.charAt(0).toUpperCase();
                    return _first + _str.substr(1, _str.length-1);
                };

                var role = ucfirst(scenario.getNextRole());
                infoPolygon.innerHTML = (isWinner) ? role + ' is Winner!' : 'Next is ' + role;
            })
        },
        scenario: {
            canContinue: true,
            next: 0,
            current: 1,
            roles: ['cross', 'nought'],
            filled: {
                cross: [],
                nought: []
            },
            isAllowedToPick: (function(id){
                var _filled = this.filled;
                var filledAll = _filled['cross'].concat(_filled['nought']);

                return ( filledAll.indexOf(parseInt(id)) == -1 );
            }),
            applyCurrent: (function(){
                var _self = this;
                this.next = _self.current;
                switch (_self.current) {
                    case 0:
                        this.current = 1;
                        break;
                    case 1:
                        this.current = 0;
                        break;
                }
            }),
            getRole: (function(){
                return this.roles[this.current];
            }),
            getNextRole: (function(){
                return this.roles[this.next];
            }),
            setFilled: (function(variation, role){
                this.filled[role].push(parseInt(variation));
            }),
            isCompleted: (function(summary){
                var role = this.getRole();
                var filled = this.filled[role];

                var combinations = [[2,7,6],[9,5,1],[4,3,8],[2,9,4],[7,5,3],[6,1,8],[2,5,8],[6,5,4]];

                var total = 0;
                for (var i in combinations) {

                    total = combinations[i].length;
                    for (var j in combinations[i]) {
                        if (filled.indexOf(combinations[i][j]) >= 0) {
                            total--;
                        }
                    }

                    if (total == 0) {
                        this.canContinue = false;
                        return true;
                    }
                }
                return false;
            })
        }
    },
    call: function(e) {
        console.log(e);
    },
    __construct: function() {
        this.__objectLoader(TheGame.models, 'Model'); //Initiating aliases
        return this;
    },
    __objectLoader: function(loadable, _suffix) {
        for (var obj in loadable) {
            if (loadable.hasOwnProperty(obj)) {
                var attr = loadable[obj];
                var _model = [obj, _suffix].join('');
                TheGame[_model] = attr;
            }
        }
    }
},
    TheGame.run = TheGame.__construct
    );

var game = TheGame.run();
var gamePolygon = game.polygonModel('gameLayer');
var infoPolygon = game.polygonModel('infoLayer');
game.gridModel.build(gamePolygon, infoPolygon, game.scenarioModel);