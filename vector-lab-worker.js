import {analyseRecords} from './vector-lab-data.js?v=0.4.21';
self.onmessage=({data})=>{try{self.postMessage({result:analyseRecords(data.records,data.algorithm)});}catch(e){self.postMessage({error:e.message});}};
