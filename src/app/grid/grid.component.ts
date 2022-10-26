import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  dataSource: any = {};

  //https://js.devexpress.com/Documentation/Guide/Data_Binding/Specify_a_Data_Source/Custom_Data_Sources/#
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.loadDataSource();
  }

  loadDataSource() {

    //sample api
    //https://jsonplaceholder.typicode.com/todos



    this.dataSource = new CustomStore({
      key: 'id',
      load: (loadOptions: any) => {
        const take = 0;
        const skip = 0;
        let paramObj = {take: loadOptions?.take ?? 10, svikip: loadOptions?.skip ?? 0}
        let params: HttpParams = new HttpParams({fromObject: paramObj});
      const promise = this.httpClient.get('http://localhost:54887/api/grid', { params })
        .toPromise();
       return promise
                 .then(
                   (data: any) =>
                           {
                              data.totalCount = 400;
                                return   ({

                                    data: data.data,
                                    totalCount: data.totalCount,
                                  //  summary: data.summary,
                                  //  groupCount: data.groupCount,
                                   })
                            })

      }

      // totalCount: (option) => {
      //   const kk = of(1).toPromise()
      //   return kk;
      // }

    });

    this.dataSource.totalCount()
        .then(
          (count: any) => {console.log('process the count here '+count as string)},
          (error: any) => { /* Handle the "error" here */ console.log(error) }
        )
  }



}
