const fs = require('fs');
const path = require('path');

const chatPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Chat.jsx');
const editProfilePath = path.join(__dirname, 'frontend', 'src', 'pages', 'EditProfile.jsx');

// Fix Chat.jsx - line 332: stray backtick before the closing }
let chatContent = fs.readFileSync(chatPath, 'utf8');
const oldChatLine = '            <Link to={`/profile/${otherUser?._id}`} className="flex items-center gap-3">';
const newChatLine = '            <Link to={`/profile/${otherUser?._id}`} className="flex items-center gap-3">';
chatContent = chatContent.replace(oldChatLine, newChatLine);
fs.writeFileSync(chatPath, chatContent);
console.log('Chat.jsx fixed:', chatContent.includes(newChatLine));

// Fix EditProfile.jsx - line 418: stray } before >
let editContent = fs.readFileSync(editProfilePath, 'utf8');
const oldEditLine = "                <p style={{ fontSize: 10, color: '#9d4c6e', lineHeight: 1.55, margin: 0 }}>";
const newEditLine = "                <p style={{ fontSize: 10, color: '#9d4c6e', lineHeight: 1.55, margin: 0 }}>";
editContent = editContent.replace(oldEditLine, newEditLine);
fs.writeFileSync(editProfilePath, editContent);
console.log('EditProfile.jsx fixed:', editContent.includes(newEditLine));
