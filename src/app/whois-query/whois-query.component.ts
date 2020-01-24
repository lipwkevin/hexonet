const KEY = 3;

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { QueryService } from '../query.service';

@Component({
  selector: 'app-whois-query',
  templateUrl: './whois-query.component.html',
  styleUrls: ['./whois-query.component.css'],
})
export class WhoisQueryComponent implements OnInit {
  inputDomain = '';
  serverRespond = [];
  key = KEY;

  constructor(private httpClient: HttpClient, private queryService: QueryService) { }

  ngOnInit() { }

  // convert Uint8Array to string
  ab2str(buf) {
    return String.fromCharCode.apply(null, (buf));
  }

  //decode function
  decodeRailFence(input,key){
    var output = [];
    var length = Math.ceil(input.length/key)
    var array = [];
    var index = 0;
    while (index < input.length) {
      array.push(input.slice(index, length + index));
      index += length;
    }
    for(var i=0;i<length;i++){
      for(var j=0;j<key;j++){
        if(array[j][i] != undefined)
          output.push(array[j][i]);
      }
    }
    return output
  }

  sendQuery() {
    this.serverRespond = [];
    this.queryService.sendQuery(this.inputDomain);
    this.queryService
      .getRespond()
      .subscribe((respond) => {
        // decode the respond array
        respond = this.decodeRailFence(respond,this.key);
        // convert the decoded array to string before pushing
        this.serverRespond.push(this.ab2str(respond));
      });
    this.queryService
      .getKey()
      .subscribe((respond) => {
        //update the decode key
        this.key=respond;
      });
  }
}
