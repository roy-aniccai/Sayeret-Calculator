const fs = require('fs');

// Read the file
let content = fs.readFileSync('components/steps/SingleTrackStep6Simulator.tsx', 'utf8');

// Remove the first duplicate button (blue button in no-mortgage-savings case) - lines 398-405
content = content.replace(
  /              <Button\s+onClick={handleContactExpert}\s+className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"\s+>\s+<i className="fa-solid fa-phone-volume mr-2"><\/i>\s+לשיחה עם המומחים\s+<\/Button>/,
  ''
);

// Remove the second duplicate button (green button in insufficient-savings case) - lines 449-456  
content = content.replace(
  /              <Button\s+onClick={handleContactExpert}\s+className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"\s+>\s+<i className="fa-solid fa-phone-volume mr-2"><\/i>\s+לשיחה עם המומחים\s+<\/Button>/,
  ''
);

// Remove the third duplicate button (Version B CTA) - lines 502-511
content = content.replace(
  /          <div className="mt-6 space-y-3">\s+<Button\s+onClick={handleContactExpert}\s+className="w-full py-3 md:py-4[^>]+>\s+<span className="flex items-center justify-center gap-2">\s+<i className="fa-solid fa-phone-volume animate-bounce"><\/i>\s+לשיחה עם המומחים\s+<\/span>\s+<\/Button>\s+<button[^>]+onClick={handleTryAnother}[^>]+>\s+בדוק תרחיש אחר\s+<\/button>\s+<\/div>/,
  ''
);

// Remove the fourth duplicate button (orange button in no-solution case) - lines 732-738
content = content.replace(
  /                <Button\s+onClick={handleContactExpert}\s+className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md"\s+>\s+<i className="fa-solid fa-comments mr-2"><\/i>\s+דבר עם יועץ לבדיקה ידנית\s+<\/Button>/,
  ''
);

// Write the file back
fs.writeFileSync('components/steps/SingleTrackStep6Simulator.tsx', content, 'utf8');

console.log('Fixed duplicate CTAs');
