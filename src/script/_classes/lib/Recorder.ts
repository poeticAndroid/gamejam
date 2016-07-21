
import Protagonist  = require("../sprites/Protagonist");

class Recorder{
  private _ghostData:Phaser.Point[][];
  private _index: number;
  private _ghostAmount : number;

  constructor()
  {
    this._ghostData = [];
    this._index = -1;
    this._ghostAmount = -1;
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
    this._ghostAmount++;
    this._ghostData[this._ghostAmount] = [];
  }

  record(recordee:Phaser.Sprite)
  {
    //this._ghostData[this._ghostAmount].push(recordee.getVelocity());
  }

  getGhostAmount()
  {
    return this._ghostAmount;
  }

  getRecord(ghostNr:number)
  {
    return this._ghostData[ghostNr][this._index] ? this._ghostData[ghostNr][this._index] : null;
  }

  printLatest()
  {
    console.log(this._ghostData[0][this._index]);
  }
}
export = Recorder;
