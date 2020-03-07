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
  selector: 'table-http-example',
  styleUrls: ['table-http-example.css'],
  templateUrl: 'table-http-example.html',
})
export class TableHttpExample implements AfterViewInit {
  displayedColumns = ['name', 'region', 'area', 'population'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource = new MatTableDataSource();
  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;
  avgOfPopulation: number = 0;
  minArea: number = 0;
  maxArea: number = 0;
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
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.length;
          var som = 0;
          this.minArea = data[0].area;
          this.maxArea = data[0].area;
          for(var i=0;i<data.length;i++) {
            som= som +data[i].population;
            if(data[i].area<this.minArea) {
              this.minArea = data[i].area;

            }
            if(data[i].area>this.maxArea) {
              this.maxArea = data[i].area;
            }
          }
          this.avgOfPopulation = som / data.length;

          var sorteddata = [];
          if(this.sort.direction == "asc") {
            sorteddata = data.sort((v1,v2) => v1.area - v2.area );
          } else {
            sorteddata = data.sort((v1,v2) => v2.area - v1.area );
          }
          return sorteddata;
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

  getRepoIssues(sort: string, order: string, page: number): Observable<any> {
    const href = 'https://restcountries.eu/rest/v2/all';

    return this.http.get<any>(href);
  }
}

export interface DataSchema {
  region: any;
  population: any;
  name: any;
  languages: {name:any;};
  area: any;
}
