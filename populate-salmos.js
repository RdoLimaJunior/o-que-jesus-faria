/**
 * Script para popular todos os 150 salmos no salmos.json
 * Usa a Bible API para buscar os textos completos
 *
 * Uso: node populate-salmos.js <BIBLE_API_KEY>
 */

const fs = require('fs');

async function fetchPsalmText(psalmNumber, apiKey) {
  try {
    const searchUrl = `https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02/search?query=psalm%20${psalmNumber}&limit=1`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'api-key': apiKey }
    });

    if (!searchRes.ok) {
      console.log(`❌ Salmo ${psalmNumber}: erro na busca (status ${searchRes.status})`);
      return null;
    }

    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`❌ Salmo ${psalmNumber}: não encontrado`);
      return null;
    }

    const verseId = searchData.results[0].verseId;
    const textUrl = `https://api.api-bible.com/v1/bibles/de4e12af7f28f599-02/verses/${verseId}?content-type=text`;
    const textRes = await fetch(textUrl, {
      headers: { 'api-key': apiKey }
    });

    if (!textRes.ok) {
      console.log(`❌ Salmo ${psalmNumber}: erro ao buscar texto`);
      return null;
    }

    const textData = await textRes.json();
    const texto = textData.data?.content || '';

    if (!texto) {
      console.log(`❌ Salmo ${psalmNumber}: texto vazio`);
      return null;
    }

    console.log(`✅ Salmo ${psalmNumber}: carregado`);
    return texto;
  } catch (err) {
    console.log(`❌ Salmo ${psalmNumber}: erro - ${err.message}`);
    return null;
  }
}

async function populateSalmos(apiKey) {
  console.log('📖 Carregando salmos.json...');
  const data = JSON.parse(fs.readFileSync('salmos.json', 'utf-8'));

  console.log(`🔄 Buscando textos para ${data.salmos.length} salmos...\n`);

  for (let i = 0; i < data.salmos.length; i++) {
    const salmo = data.salmos[i];
    if (!salmo.texto) {
      const texto = await fetchPsalmText(salmo.numero, apiKey);
      if (texto) {
        salmo.texto = texto;
      }
    } else {
      console.log(`⏭️  Salmo ${salmo.numero}: já tem texto`);
    }

    // Rate limiting - 1 request por segundo
    if (i < data.salmos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n💾 Salvando salmos.json...');
  fs.writeFileSync('salmos.json', JSON.stringify(data, null, 2));
  console.log('✅ Concluído!');
}

const apiKey = process.argv[2];
if (!apiKey) {
  console.error('❌ Erro: Bible API key não fornecida');
  console.error('Uso: node populate-salmos.js <BIBLE_API_KEY>');
  process.exit(1);
}

populateSalmos(apiKey).catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
