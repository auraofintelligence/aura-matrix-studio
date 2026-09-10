"""Snapshot every layer in the published Horn Torus map, preserving source metadata.

Reads JSON assignments as data; never executes downloaded JavaScript.
"""
import concurrent.futures
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://auraofintelligence.github.io/aura-horn-torus/'

def decode(source, marker):
    return json.JSONDecoder().raw_decode(source.split(marker, 1)[1])[0]

def build():
    manifest_bytes = urlopen(BASE + 'data/location-layers.js', timeout=60).read()
    source = manifest_bytes.decode('utf-8-sig')
    manifest = decode(source, 'window.AURA_LOCATION_MANIFEST=')
    target = ROOT / 'assets' / 'earth'
    target.mkdir(exist_ok=True)
    def layer(meta):
        path = meta.get('src', 'data/location-layers.js')
        if not path.startswith('data/') or '..' in path:
            raise ValueError('Unexpected source path')
        raw = urlopen(BASE + path, timeout=60).read() if meta.get('src') else manifest_bytes
        rows = decode(raw.decode('utf-8-sig'), 'window.AURA_LOCATION_DATA[' + json.dumps(meta['id']) + ']=')
        assert len(rows) == meta['mappedCount'], meta['id']
        assert all(isinstance(r[0], str) and -90 <= r[1] <= 90 and -180 <= r[2] <= 180 for r in rows)
        file = meta['id'] + '.json'
        (target / file).write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        return {**meta, 'data': 'assets/earth/' + file, 'publishedSource': BASE + path,
                'snapshotSha256': hashlib.sha256(raw).hexdigest()}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        layers = list(pool.map(layer, manifest))
    result = {'format': 'aura-earth-layers/1', 'source': BASE, 'retrievedAt': datetime.now(timezone.utc).isoformat(),
              'layers': layers, 'total': sum(x['mappedCount'] for x in layers)}
    (target / 'manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'layers': len(layers), 'places': result['total']}))

if __name__ == '__main__':
    build()
