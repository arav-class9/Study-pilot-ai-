import { generateNotes } from './server/services/notesGenerator';

async function run() {
  try {
    const notes = await generateNotes({
      subject: 'History',
      classLevel: '10',
      chapter: 'World War 2',
      topic: 'Causes of the war',
      detailLevel: 'detailed',
    });
    console.log("Success:\n" + JSON.stringify(notes, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
