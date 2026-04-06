const fs = require('fs');

const chatPath = 'frontend/src/pages/Chat.jsx';
const editProfilePath = 'frontend/src/pages/EditProfile.jsx';

function readLine(content, lineNum) {
  const lines = content.split('\n');
  return lines[lineNum - 1];
}

// Read files
const chatContent = fs.readFileSync(chatPath, 'utf8');
const editContent = fs.readFileSync(editProfilePath, 'utf8');

console.log('=== Chat.jsx Line 332 ===');
const chatLine = readLine(chatContent, 332);
console.log(JSON.stringify(chatLine));
console.log('Bytes:', Buffer.from(chatLine).toString('hex'));

console.log('\n=== EditProfile.jsx Line 418 ===');
const editLine = readLine(editContent, 418);
console.log(JSON.stringify(editLine));
console.log('Bytes:', Buffer.from(editLine).toString('hex'));
