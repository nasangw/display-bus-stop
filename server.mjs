import express from 'express';
import convert from 'xml-js';
import fetch from "node-fetch";
import cors from 'cors';
import config from './Config.mjs';

const app = express();
const xmlConvertOptions = {
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
};


// CORS 설정
app.use(cors());

// 주변 버스정류장 리스트를 받아온다.
app.get("/getStationByPos", (req, res) => {
  var isFormatXml;

  // URL QueryString값을 params객체에 적용
  const params = {
    serviceKey: config.keyDataOrKr, // api Key
    tmX: req.query.lng,
    tmY: req.query.lat,
    radius: req.query.radius,
  };

  // uri는 버스정류장 데이터URL과 params객체값을 queryString으로 적용해 string값을 리턴한다.
  const uri = getUrlByCombineParam(config.apiURI.getStationByPos, params);

  fetch(uri)
  .then(response => {
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
      result = convert.xml2json(result, xmlConvertOptions);

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

// 버스정류장의 버스도착 데이터를 받아온다.
app.get("/getStationByUid", (req, res) => {
  var isFormatXml;

  // URL QueryString값을 params객체에 적용
  const params = {
    serviceKey: config.keyDataOrKr, // api Key
    arsId: req.query.arsId.length < 5 ? `0${req.query.arsId}` : req.query.arsId,
    // arsId: req.query.arsId,
  };

  // uri는 버스정류장 데이터URL과 params객체값을 queryString으로 적용해 string값을 리턴한다.
  const uri = getUrlByCombineParam(config.apiURI.getStationByUid, params);
  // console.log(uri);

  fetch(uri)
  .then(response => {
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
      result = convert.xml2json(result, xmlConvertOptions);

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
function getUrlByCombineParam(str, params) {
  if(!str.length || !Object.keys(params).length) {
    return;
  }

  // set params to url
  Object.keys(params).forEach((key, idx) => {
    str += `${idx === 0 ? '?' : '&'}${key}=${params[key]}`;
  });
  return str;
}

function getNativeType(value) {
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
    parentElement._parent[keyName] = getNativeType(value);
  } catch (e) {}
}