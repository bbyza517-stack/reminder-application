const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('gorevler.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS gorevler (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    baslik TEXT NOT null, 
    sonTarih TEXT NOT null, 
    sure INTEGER, 
    tamamlandi INTEGER DEFAULT 0, 
    sabitli INTEGER DEFAULT 0, 
    oncelik TEXT DEFAULT 'orta' , 
    kategori TEXT, 
    atananKisi TEXT 
    )
`);


const kolonlar = db.prepare(`
    PRAGMA table_info(gorevler)
    `).all();

    const notKolonuVar = kolonlar.some(kolon =>
        kolon.name === 'notlar'
    );

    if(!notKolonuVar) {
        db.exec(`
            ALTER TABLE gorevler
            ADD COLUMN notlar TEXT
            `);
    }

db.exec(`
    CREATE TABLE IF NOT EXISTS kisiler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT NOT NULL UNIQUE
        )
`);



db.exec(`
    INSERT OR IGNORE INTO kisiler (ad)
    SELECT DISTINCT atananKisi
    FROM gorevler
    WHERE atananKisi IS NOT NULL
        AND TRIM(atananKisi) != ''
`);

module.exports =db;