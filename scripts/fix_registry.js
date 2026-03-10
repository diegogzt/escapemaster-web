const fs = require('fs');
const file = 'src/components/domain/dashboard/widget-registry.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/minColSpan:\s*(\d+)/g, (m, p1) => {
    let val = parseInt(p1);
    if (val === 24) return 'minColSpan: 12'; // 1/4 screen is tiny enough
    if (val >= 16) return 'minColSpan: 12'; 
    if (val >= 12) return 'minColSpan: 8';
    if (val >= 8) return 'minColSpan: 6';
    return m;
});

content = content.replace(/minRowSpan:\s*(\d+)/g, (m, p1) => {
    let val = parseInt(p1);
    if (val >= 30) return 'minRowSpan: 16';
    if (val >= 20) return 'minRowSpan: 14';
    if (val >= 18) return 'minRowSpan: 12';
    if (val >= 15) return 'minRowSpan: 10';
    if (val >= 12) return 'minRowSpan: 8';
    return m;
});

fs.writeFileSync(file, content);
console.log("Registry modified successfully.");
