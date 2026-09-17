const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove Sidebar and BottomNav imports and tags
code = code.replace("import { SidebarMenu as Sidebar } from './components/layout/SidebarMenu';", "");
code = code.replace("import { BottomNav } from './components/layout/BottomNav';", "");
code = code.replace(/<Sidebar \/>/g, "");
code = code.replace(/<BottomNav \/>/g, "");

fs.writeFileSync('src/App.tsx', code, 'utf8');
