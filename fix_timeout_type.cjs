const fs = require('fs');
const filepath = 'src/components/Topbar/Topbar.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

const search = `  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;`;

const replace = `  useEffect(() => {
    let timeoutId: number | undefined;`;

const search2 = `      timeoutId = window.setTimeout(syncClock, msUntilNextMinute);`;
const replace2 = `      timeoutId = window.setTimeout(syncClock, msUntilNextMinute);`;

content = content.replace(search, replace);
fs.writeFileSync(filepath, content);
