import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

export class QueryService {
    private url = 'http://localhost:3000';
    private socket;

    constructor() {
        // this.socket = io(this.url);
    }

    public sendQuery(query){
      this.socket = io(this.url);
      this.socket.emit('new-query', query);
    }

    public getRespond = () => {
        return Observable.create((observer) => {
            this.socket.on('new-respond', (respond) => {
                observer.next(respond);
            });
        });
    }
    public getKey = () => {
        return Observable.create((observer) => {
            this.socket.on('get-key', (respond) => {
                observer.next(respond);
            });
        });
    }
}
