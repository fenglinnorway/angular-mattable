import {Component, AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'table-http-example1',
  styleUrls: ['table-http-example1.css'],
  templateUrl: 'table-http-example1.html',
})
export class TableHttpExample1 implements AfterViewInit {
  displayedColumns = ['language', 'countries', 'population'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource = new MatTableDataSource();
  resultsLength = 0;
  dataMap = new Map();
  isLoadingResults = false;
  isRateLimitReached = false;
  length = 0;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.exampleDatabase = new ExampleHttpDao(this.http);
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = false;

          var responseData = data;
          var returnData =[];

          for(let i=0;i<data.length;i++) {
            var dataSchema = {language:"eng", countries:[], population: 0};
            if (!this.dataMap.has(responseData[i].languages[0].name)) {
              //
              responseData[i].languages[0].name
              dataSchema.language = responseData[i].languages[0].name;
              dataSchema.countries.push(responseData[i].name);
              dataSchema.population += responseData[i].population;
              this.dataMap.set(dataSchema.language, dataSchema);
            } else {
              if (!this.dataMap.get(responseData[i].languages[0].name).countries.includes(responseData[i].name)){
                this.dataMap.get(responseData[i].languages[0].name).countries.push(responseData[i].name);
                this.dataMap.get(responseData[i].languages[0].name).population += responseData[i].population;
              }

            }
          }


          this.dataMap.forEach((value, key) => {
            let jsonObject = {};
            jsonObject["language"] = value["language"];
            jsonObject["countries"] = value["countries"];
            jsonObject["population"] = value["population"];
            returnData.push(jsonObject);
          });
          this.resultsLength = returnData.length;
          return returnData;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
    ).subscribe(data => {this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
    });
  }
}


export class ExampleHttpDao {
  constructor(private http: HttpClient) {}

  getRepoIssues(sort: string, order: string, page: number): Observable<DataSchema[]> {
    const href = 'https://restcountries.eu/rest/v2/all';

    return this.http.get<DataSchema[]>(href);
  }
}

export interface DataSchema {
  language: any;
  countries: any;
  population: any;
  name: any;
}
