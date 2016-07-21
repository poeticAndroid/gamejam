
import Protagonist  = require("../sprites/Protagonist");

class Recorder{
  private _ghostData:Phaser.Point[][];
  private _index: number;
  private _ghostAmount : number;

  constructor()
  {
    this._ghostData = [];
    this._index = -1;
    this._ghostAmount = 0;
  }

  update()
  {
    this._index++;
  }

  resetIndex()
  {
    this._index = -1;
  }

  addGhostRecord()
  {
    this._ghostData[this._ghostAmount] = [];
    this._ghostAmount++;
  }

  record(recordee:Phaser.Sprite)
  {
    this._ghostData[this._ghostAmount - 1].push(new Phaser.Point(recordee.body.velocity.x, recordee.body.velocity.y));
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
    console.log("Latest ghostrecord: " + this.getRecord(this._ghostAmount - 1) + "\nIndex: " + this._index);
  }

  printEntireRecord(ghostNr:number)
  {
    console.log("Printing entire record for ghostNr:" + ghostNr);
    for (var i = 0; this._ghostData[i] !== undefined; i++) {
      console.log(this._ghostData[i].toString());
    }
  }

  print()
  {
    console.log("print");
    console.log(this._ghostAmount + " " + this._index);
  }
}
export = Recorder;
