import {Pipe, PipeTransform} from '@angular/core';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

@Pipe({
  name: 'timeAgo',
  pure: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(time: number): string {
    if (!time) {
      return '';
    }

    const seconds = Math.floor(Date.now() / 1000) - time;
    if (seconds < MINUTE) {
      return 'just now';
    }

    const units: Array<{seconds: number, name: string}> = [
      {seconds: YEAR, name: 'year'},
      {seconds: MONTH, name: 'month'},
      {seconds: DAY, name: 'day'},
      {seconds: HOUR, name: 'hour'},
      {seconds: MINUTE, name: 'minute'}
    ];

    for (const unit of units) {
      const value = Math.floor(seconds / unit.seconds);
      if (value >= 1) {
        return `${value} ${unit.name}${value === 1 ? '' : 's'} ago`;
      }
    }

    return 'just now';
  }
}
