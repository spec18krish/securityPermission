import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  transform(value: number): string {
    if (value) {
      let dateVal = new Date(value as any as number);
      return moment(dateVal).format("hh:mm:ss A");
    }
    return value?.toString();
  }
}
