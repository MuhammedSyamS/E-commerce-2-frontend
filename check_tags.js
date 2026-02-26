const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Admin\\Desktop\\HighPhaus\\client\\src\\pages\\ProductDetails.jsx', 'utf8');

const regex = /<div|<\/div/g;
let match;
let level = 0;
const stack = [];

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.matchAll(/<div|<\/div/g);
    for (const m of matches) {
        if (m[0] === '<div') {
            const isSelfClosing = line.includes('/>') && line.indexOf('/>') > m.index;
            if (!isSelfClosing) {
                level++;
                stack.push({ line: i + 1, level });
            }
        } else {
            level--;
            stack.pop();
        }
    }
}

console.log('Final Level:', level);
if (stack.length > 0) {
    console.log('Unclosed tags starting at:');
    stack.forEach(s => console.log('Line ' + s.line + ' (Level ' + s.level + ')'));
}
