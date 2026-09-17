const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

code = code.replace(
  /<div className="max-w-7xl mx-auto flex items-center justify-between">/g,
  '<div className="max-w-7xl mx-auto flex items-center justify-between relative">'
);

code = code.replace(
  /{[/][*] Left: Logo [*][/]}\s*<div className="flex items-center gap-2 cursor-pointer"/g,
  '{/* Left: Logo */}\n          <div className="flex-1 flex items-center justify-start gap-2 cursor-pointer"'
);

code = code.replace(
  /{[/][*] Center: Desktop Navigation Links [*][/]}\s*<nav className="hidden lg:flex items-center gap-1">/g,
  '{/* Center: Desktop Navigation Links */}\n          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">'
);

code = code.replace(
  /{[/][*] Right: Actions [*][/]}\s*<div className="flex items-center gap-2 sm:gap-4">/g,
  '{/* Right: Actions */}\n          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">'
);

fs.writeFileSync('src/components/layout/Navbar.tsx', code, 'utf8');
