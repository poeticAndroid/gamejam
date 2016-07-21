
import Protagonist  = require("../sprites/Protagonist");

class Recorder{
  private _ghostData:Phaser.Point[][];
  private _index: number;
  private _ghostAmount : number;

  constructor()
  {
    this._ghostData = [];
    this._index = 0;
    this._ghostAmount = 0;
  }

  update()
  {
    this._index++;
  }

  resetIndex()
  {
    this._index = 0;
  }

  addGhostRecord()
  {
    this._ghostData[this._ghostAmount] = [];
    this._ghostAmount++;
  }

  record(recordee:Protagonist, ghostNr:number)
  {
    this._ghostData[ghostNr][this._index] = recordee.getVelocity();
  }

  getRecord(ghostNr:number)
  {
    return this._ghostData[ghostNr][this._index];
  }

  printLatest()
  {
    console.log(this._ghostData[0][this._index]);
  }
}
export = Recorder;
