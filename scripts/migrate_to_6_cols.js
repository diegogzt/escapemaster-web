const fs = require('fs');
const file = 'src/components/domain/dashboard/widget-registry.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/(defaultColSpan|minColSpan):\s*(\d+)/g, (m, p1, p2) => {
    let val = parseInt(p2);
    // 48 grid -> 6 grid (divide by 8)
    let newVal = Math.max(1, Math.round(val / 8));
    return `${p1}: ${newVal}`;
});

content = content.replace(/(defaultRowSpan|minRowSpan):\s*(\d+)/g, (m, p1, p2) => {
    let val = parseInt(p2);
    // Row heights were 10px, will be 50px (divide spans by 5)
    let newVal = Math.max(1, Math.round(val / 5));
    return `${p1}: ${newVal}`;
});

fs.writeFileSync(file, content);
console.log("Registry modified successfully to 6-col grid.");
