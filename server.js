const express = require('express');
const db = require('./database');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/gorevler',(req, res) => {
    const gorevler = db.prepare('SELECT * FROM gorevler').all();
    res.json(gorevler);
});



app.post('/api/gorevler',(req, res)=> {
    const {
        baslik,
        sonTarih,
        sure,
        oncelik,
        kategori,
        atananKisi,
        notlar
    }= req.body;

    const sorgu= db.prepare(`
        INSERT INTO gorevler
        (baslik,sonTarih,sure,oncelik,kategori,atananKisi,notlar)
        VALUES (?,?,?,?,?,?,?)
    `);

    const sonuc = sorgu.run(
        baslik,
        sonTarih,
        sure,
        oncelik,
        kategori,
        atananKisi,
        notlar
    );

    res.json({
        mesaj: 'Görev veritabanına eklendi',
        id: Number(sonuc.lastInsertRowid)
    });
});



app.delete('/api/gorevler/:id', (req, res)=>{
    const id = Number(req.params.id);

    const sonuc = db.prepare(
        'DELETE FROM gorevler WHERE id = ?'
    ).run(id);

    if(Number(sonuc.changes)===0) {
        return res.status(404).json({
            mesaj: 'Görev bulunamadı'
        });
    }

    res.json({
        mesaj: 'Görev silindi'
    });
});



app.patch('/api/gorevler/:id/tamamla',(req,res)=>{
    const id= Number(req.params.id);

    const sonuc=db.prepare(
        'UPDATE gorevler SET tamamlandi = 1 WHERE id = ?'
    ).run(id);

    if (Number(sonuc.changes)===0) {
        return res.status(404).json({
            mesaj: 'Görev bulunamadı'
        });
    }

    res.json({
        mesaj: 'Görev tamamlandı'
    });
});



app.patch('/api/gorevler/:id/sabitle',(req,res)=> {
    const id=Number(req.params.id);

    const sonuc = db.prepare(`
        UPDATE gorevler
        SET sabitli = CASE
            WHEN sabitli = 1 THEN 0
            ELSE 1
        END
        WHERE id = ?
        `).run(id);

        if(Number(sonuc.changes)===0) {
            return res.status(404).json({
                mesaj:'Görev bulunamadı'
            });
        }

        res.json({
            mesaj: 'Sabitleme durumu değiştirildi'
        });
});



app.patch('/api/gorevler/:id',(req, res)=> {
    const id = Number(req.params.id);

    const {
        baslik,
        sonTarih,
        sure,
        oncelik,
        kategori,
        atananKisi,
        notlar
    } = req.body;

    const sonuc = db.prepare(`
        UPDATE gorevler
        SET baslik = ?,
            sonTarih = ?,
            sure= ?,
            oncelik = ?,
            kategori = ?,
            atananKisi = ?
        WHERE id = ?
    `).run(
        baslik,
        sonTarih,
        sure,
        oncelik,
        kategori,
        atananKisi,
        id
    );

    if(Number(sonuc.changes)===0) {
        return res.status(404).json({
            mesaj:'Görev bulunamadı'
        });
    }

    res.json({
        mesaj: 'Görev güncellendi'
    });
});



app.post('/api/gorevler/import',(req, res) => {
    const gelenGorevler = req.body;

    if(!Array.isArray(gelenGorevler)) {
        return res.status(400).json({
            mesaj: 'Geçersiz JSON dosyası'
        });
    }

    db.prepare('DELETE FROM gorevler').run();

    const ekle = db.prepare(`
        INSERT INTO gorevler
        (baslik, sonTarih, sure, tamamlandi, sabitli, oncelik, kategori, atananKisi)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        `);

        gelenGorevler.forEach(g => {
            ekle.run(
                g.baslik,
                g.sonTarih,
                g.sure,
                g.tamamlandi ? 1 : 0,
                g.sabitli ? 1 : 0,
                g.oncelik || 'orta',
                g.kategori || '',
                g.atananKisi || ''
            );
        });

        res.json({
            mesaj: 'Görevler içe aktarıldı'
        });
});




app.get('/api/kisiler',(req,res)=> {
    const kisiler = db.prepare(
        'SELECT * FROM kisiler ORDER BY ad'
    ).all();

    res.json(kisiler);
});



app.post('/api/kisiler', (req,res)=> {
    const ad = req.body.ad?.trim();

    if(!ad) {
        return res.status(400).json ({
            mesaj: 'Kişi adı boş olamaz'
        });
    }

    db.prepare(
        'INSERT OR IGNORE INTO kisiler (ad) VALUES (?)' //? optional chaining ad varsa trim yoksa hata verme
    ).run(ad);

    const kisi = db.prepare(
        'SELECT * FROM kisiler WHERE ad = ?'
    ).get(ad);

    res.json(kisi);
});

//GET kisileri getir POST yeni kisi ekle

app.listen(3000, ()=> {
    console.log('Sunucu çalışıyor: http://localhost:3000');
});