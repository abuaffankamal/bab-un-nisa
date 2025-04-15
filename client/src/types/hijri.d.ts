declare module 'hijri' {
  class Hijri {
    constructor(date?: Date);
    getDate(): number;
    getMonth(): number;
    getYear(): number;
    toString(): string;
  }
  
  export = Hijri;
}