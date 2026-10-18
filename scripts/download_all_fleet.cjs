const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'assets', 'cars');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map each vehicle to its best Wikimedia Commons file
const fleetFiles = [
  {
    key: 'mercedes-v-class',
    filename: 'mercedes-v-class.jpg',
    wikiFile: 'File:Mercedes-Benz_V_250_d_Exclusive_AMG_Line_Lang_(V_447)_–_Frontansicht,_29._Juni_2016,_Düsseldorf.jpg',
    fallback: 'File:2019_Mercedes-Benz_V-Class_(W447)_1X7A1743.jpg'
  },
  {
    key: 'toyota-land-cruiser',
    filename: 'toyota-land-cruiser.png',
    wikiFile: 'File:2021_Toyota_Land_Cruiser_300_3.4_ZX_(Colombia)_front_view_04.png',
    fallback: 'File:2021_Toyota_Land_Cruiser_300_3.4_ZX_(Colombia)_front_view_02.png'
  },
  {
    key: 'kia-k5',
    filename: 'kia-k5.jpg',
    wikiFile: 'File:2022_Kia_K5_GT-Line_in_Pacific_Blue,_Front_Left,_09-05-2022.jpg',
    fallback: 'File:0_Kia_K5_(DL3)_0.jpg'
  },
  {
    key: 'bestune-b70',
    filename: 'bestune-b70.jpg',
    wikiFile: 'File:Bestune_B70_III_facelift_003.jpg',
    fallback: 'File:Bestune_B70_III_003.jpg'
  },
  {
    key: 'hyundai-staria',
    filename: 'hyundai-staria.png',
    wikiFile: 'File:Hyundai_Staria.png',
    fallback: 'File:Hyundai_Staria_1X7A0321.jpg'
  },
  {
    key: 'kia-carnival',
    filename: 'kia-carnival.jpg',
    wikiFile: 'File:Kia_Carnival_KA4_PE_1.6T_EX_HEV_Snowflake_White_Pearl.jpg',
    fallback: 'File:KIA_CARNIVAL_(KA4)_China_(5).jpg'
  },
  {
    key: 'toyota-veloz',
    filename: 'toyota-veloz.jpg',
    wikiFile: 'File:2021_Toyota_Veloz_1.5_Q_(Indonesia)_front_view.jpg',
    fallback: 'File:2025_Toyota_Veloz_Q_HV_CVT_TSS_Modellista_front_view.jpg'
  },
  {
    key: 'mitsubishi-xpander',
    filename: 'mitsubishi-xpander.jpg',
    wikiFile: 'File:2018_Mitsubishi_Xpander_Ultimate_1.5_NC1W_(20190623).jpg',
    fallback: 'File:2022_Mitsubishi_Xpander_GLS_(20221009)_01.jpg'
  },
  {
    key: 'toyota-coaster',
    filename: 'toyota-coaster.jpg',
    wikiFile: 'File:Toyota_Coaster_GX_XZB70.jpg',
    fallback: 'File:Toyota_Coaster_facelift_IMG001.jpg'
  },
  {
    key: 'luxury-coach-bus',
    filename: 'luxury-coach-bus.jpg',
    wikiFile: 'File:Mercedes-Benz_Tourismo,_Berlin_(20180910_131322).jpg',
    fallback: 'File:Flixbus_(Belle_Vue_Manchester)_YG25FEP_(2).jpg'
  },
  {
    key: 'kia-carens',
    filename: 'kia-carens.jpg',
    wikiFile: 'File:2022_Kia_Carens_1.4_Luxury_Plus_(India)_front_view_02.jpg',
    fallback: 'File:Front-right_look_of_Kia_All-new_Carens_during_GIIAS_2026_in_Bandung_20260913_193240.jpg'
  },
  {
    key: 'changan-sedan',
    filename: 'changan-sedan.jpg',
    wikiFile: 'File:Changan_UNI-V_IMG01.jpg',
    fallback: 'File:Changan_Eado_IV_001.jpg'
  }
];

function getWikiImageUrl(wikiTitle, width = 1200) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`;
    https.get(url, { headers: { 'User-Agent': 'AntigravityFleetBot/1.0 (travel-erp-system@artrust.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query?.pages || {});
          const info = pages[0]?.imageinfo?.[0];
          const directUrl = info?.thumburl || info?.url;
          if (directUrl) resolve(directUrl);
          else reject(new Error('No URL in response'));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'AntigravityFleetBot/1.0 (travel-erp-system@artrust.com)',
        'Referer': 'https://commons.wikimedia.org/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(fs.statSync(destPath).size);
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${fleetFiles.length} vehicles into ${targetDir}...`);
  for (const item of fleetFiles) {
    const dest = path.join(targetDir, item.filename);
    try {
      let imgUrl;
      try {
        imgUrl = await getWikiImageUrl(item.wikiFile);
      } catch (err) {
        console.warn(`Fallback triggered for ${item.key}...`);
        imgUrl = await getWikiImageUrl(item.fallback);
      }
      console.log(`Downloading [${item.key}] from ${imgUrl}...`);
      const size = await downloadImage(imgUrl, dest);
      console.log(`  -> SUCCESS: ${item.filename} (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      console.error(`  -> ERROR for ${item.key}:`, err.message);
    }
  }
  console.log('Finished fleet image download!');
}

run();
