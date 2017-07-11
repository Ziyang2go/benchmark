var brotli = require('brotli');
var request = require('request');
var lzma = require('lzma-native');
var fs = require('fs');

var targetFile;


var run = function() {
  request({
    uri: 'https://s3-us-west-2.amazonaws.com/files.clara.io/00000236d9345c65dbc7cee6c6213165',
    method: 'GET',
  }, function(err, res, body) {
    if (err) return console.log(err);
    console.log(res.headers['content-type']);
    console.log('original file size    ', body.length);
    brotliProcess(body, function(logs, result) {
      logs.forEach(function(log) {
        console.log(log);
      })
      console.log('done brotli');
      fs.writeFile('test.br', result, function(err) {
        console.log(err);
      });
    });
    lzmaProcess(body, function(lzmalogs){
      lzmalogs.forEach(function(log) {
        console.log(log)
      });
      console.log('done LZMA2');
    })
  });
}


var brotliProcess = function(buffer, callback) {
  var logs = ['>>>>>>>>>>>>>>>>>>Compression in broli<<<<<<<<<<<<<<<<<<'];
  var time = new Date();
  var encode = brotliCompress(buffer);
  var encodeBuffer = new Buffer(encode);
  logs.push('encode result size  ' + encodeBuffer.length );
  logs.push('compress ratio   ' + encodeBuffer.length/buffer.length);
  logs.push('encode time usage   ' + (new Date() - time + ' ms') );
  time = new Date();
  var decode = brotliDecompress(encode);
  logs.push('decode result size  ' + decode.length );
  logs.push('decode time usage   ' + (new Date() - time + ' ms') );
  callback(logs, encodeBuffer);
}


var lzmaProcess = function(buffer, callback) {
  var logs = ['>>>>>>>>>>>>>>>>>>Compression in LZMA2<<<<<<<<<<<<<<<<<<'];
  var time = new Date();
  lzmaCompress(buffer, function(result) {
    logs.push('encode result size  ' + result.length);
    logs.push('compress ratio   ' + result.length/buffer.length);
    logs.push('encode time usage   ' + (new Date() - time + ' ms'));
    time = new Date();
    lzmaDecompress(result, function(decode) {
      logs.push('decode result size  ' + decode.length);
      logs.push('decode time usage   ' + (new Date() - time + ' ms'));
      callback(logs);
    });
  });
}


var brotliCompress = function(buffer) {
  return brotli.compress(buffer);
}

var brotliDecompress = function(buffer) {
  return brotli.decompress(buffer);
}

var lzmaCompress = function(buffer, callback) {
  lzma.compress(buffer, function(result) {
    callback(result);
  })
}

var lzmaDecompress = function(buffer, callback) {
  lzma.decompress(buffer, function(result) {
    callback(result);
  })
}

run();