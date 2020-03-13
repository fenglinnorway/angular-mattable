import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export class ExampleHttpDao {
    constructor(private http: HttpClient) {}

    getRepoIssues(sort: string, order: string, page: number): Observable<any[]> {
        const href = 'https://restcountries.eu/rest/v2/all';

        return this.http.get<any[]>(href);
    }
}
