// Declaration file for hijri-date module
declare module 'hijri-date' {
  class HijriDate {
    constructor(value?: Date | number | string);
    
    getFullYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
    getHours(): number;
    getMinutes(): number;
    getSeconds(): number;
    getMilliseconds(): number;
    getTime(): number;
    getTimezoneOffset(): number;
    
    format(format: string): string;
    
    toGregorian(): Date;
  }
  
  export default HijriDate;
}