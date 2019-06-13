import config from './Config.mjs';
import convert from 'xml-js';
import fetch from "node-fetch";
import express from 'express';
import cors from 'cors';

const app = express();
const api = {
  keyDataOrKr: 'KqC6MV8UsZrwWZNmdaDN34Ii7nC25rAqDtnNEPN40DSXAiHXIswyqPb%2FCPqhgmH2HORnAEYpSFsky8ExSyd1VA%3D%3D',
  getStationByPos: 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos',
  getStationByUid: 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid',
};  
const params = {
  serviceKey: api.keyDataOrKr, // api Key
  // tmX: 126.97836, // longitude
  // tmY: 37.56609, // latitude
  radius: 500, // unit: meter
}

// const uri = 'https://api.github.com/users/github';


// CORS 설정
app.use(cors());


// router.get("/", (req, res) => {
app.get("/", (req, res) => {
  var isFormatXml;

  // URL QueryString값을 params객체에 적용
  params.tmX = req.query.lng;
  params.tmY = req.query.lat;

  // uri는 버스정류장 데이터URL과 params객체값을 queryString으로 적용해 string값을 리턴한다.
  const uri = getUrlCombineParam(api.getStationByPos, params);

	fetch(uri).then(response => {
	// fetch(ttt).then(response => {
    const ct = response.headers.get("content-type").toLowerCase();

    if(ct.indexOf('/json') > -1) {
      // for JSON format
      return response.json();
    }else if(ct.indexOf('/xml') > -1) {
      // for XML format
      isFormatXml = true;
      return response.text();
    }else {
      // for PLAIN or ETC
      return response.text();
    }
  })
  .then(result => {
    if(isFormatXml) {
      result = convert.xml2json(result, {
        // convert options
        // nativeType: true <-- removeJsonTextAttribute함수에 의해 자동 적용
        spaces: 2,
        compact: true,
        trim: true,
        ignoreDeclaration: true,
        ignoreInstruction: true,
        ignoreAttributes: true,
        ignoreComment: true,
        ignoreCdata: true,
        ignoreDoctype: true,
        textFn: removeJsonTextAttribute
      });

      // reset isFormatXml variable
      isFormatXml = undefined;
    }

    res.status(200).send(result);
  })
  .catch(() => {
    // console.log('occur error');
    res.send(JSON.stringify({ message: "System Error" }));
  });
});


app.listen(config.apiURI.getStationPort);



/***************
 * 관련 함수
***************/

function getUrlCombineParam(str, params) {
  if(!str.length || !Object.keys(params).length) {
    return;
  }

  // set params to url
  Object.keys(params).forEach((key, idx) => {
    str += `${idx === 0 ? '?' : '&'}${key}=${params[key]}`;
  });
  return str;
}


function nativeType(value) {
  var nValue = Number(value);
  if (!isNaN(nValue)) {
    return nValue;
  }
  var bValue = value.toLowerCase();
  if (bValue === 'true') {
    return true;
  } else if (bValue === 'false') {
    return false;
  }
  return value;
}

function removeJsonTextAttribute(value, parentElement) {
  try {
    var keyNo = Object.keys(parentElement._parent).length;
    var keyName = Object.keys(parentElement._parent)[keyNo - 1];
    parentElement._parent[keyName] = nativeType(value);
  } catch (e) {}
}