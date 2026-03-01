const fs = require('fs');
let d = fs.readFileSync('test.js','utf16le');
fs.writeFileSync('test.js', d, 'utf8');
console.log('converted');
