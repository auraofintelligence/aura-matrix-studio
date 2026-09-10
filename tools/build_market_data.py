"""Build a repeatable, offline marketplace snapshot from Horn Torus's two business layers.

The source layers remain untouched. No Places API calls, reviews or contact details.
"""
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'aura-horn-torus' / 'data'

def normalise(text):
    return ''.join(c for c in unicodedata.normalize('NFKD', text.casefold()) if not unicodedata.combining(c))

def name_match(name):
    # Match names, never reviews, addresses or the search query that found the place.
    return bool(re.search(r'(?<!\w)(aura|chakra|aurora|gajra|yoga|tai[ -]?chi|taichi)(?!\w)', normalise(name)))

RULES = [
    ('accommodation', r'\b(hotels?|resorts?|apartments?|accommodation|villas?|guest\s?houses?|lodging|inn|suites?|hostels?)\b'),
    ('health', r'\b(spa|health|hospital|clinic|wellness|wellbeing|yoga|taichi|tai chi|beauty|salon|therap(?:y|ies)|massage|fitness|pilates)\b'),
    ('creative', r'\b(design|gallery|art|arts|media|productions?|creative|photography|fashion|music)\b'),
    ('events', r'\b(events?|entertainment|lounge|nightclub|co-working|coworking|conference)\b'),
    ('cities', r'\b(real estate|properties|developments?|condominium|building|display village)\b'),
]
SOURCE_CATEGORIES = {'Hotels':'accommodation','Resorts':'accommodation','Hospital':'health','Co-Working and Event Spaces':'events'}

def category_for(name, source_category, source):
    if source == 'alliance' and source_category in SOURCE_CATEGORIES:
        return SOURCE_CATEGORIES[source_category], 'Original Alliance category'
    for key, pattern in RULES:
        if re.search(pattern, normalise(name)):
            return key, 'Suggested from the business name'
    # Affinity categories were assigned by broad substring matching. Do not silently
    # carry that error forward when neither the name nor curated category supports it.
    return 'other', 'Needs category review'

def layer(name):
    path = SOURCE / 'layers' / (name + '.js')
    text = path.read_text(encoding='utf-8')
    prefix = f'window.AURA_LOCATION_DATA["{name}"]='
    return json.JSONDecoder().raw_decode(text.split(prefix, 1)[1])[0], hashlib.sha256(path.read_bytes()).hexdigest()

def build():
    manifest_text = (SOURCE / 'location-layers.js').read_text(encoding='utf-8')
    manifest = json.JSONDecoder().raw_decode(manifest_text.split('window.AURA_LOCATION_MANIFEST=', 1)[1])[0]
    result = {'version':1, 'sources':[], 'records':[], 'held':{}, 'rules':'Alliance records are retained. Affinity requires a whole name word matching Aura, Chakra, Aurora, Gajra, Yoga or Tai Chi. Categories use curated Alliance categories or explicit words in the name; uncertain entries stay in Other.'}
    seen = set()
    for source_id, name in [('alliance','aura-alliance'), ('affinity','aura-affinity')]:
        rows, digest = layer(name)
        metadata = next(m for m in manifest if m['id'] == name)
        result['sources'].append({'id':source_id,'label':metadata['label'],'sourceFile':metadata['sourceFile'],'sha256':digest,'sourceUpdatedAt':metadata.get('sourceUpdatedAt'),'importedAt':metadata['importedAt'],'warning':metadata['warning'],'url':'https://auraofintelligence.github.io/aura-horn-torus/','recordsRead':len(rows)})
        held = Counter()
        for row in rows:
            title, lat, lng, detail, old_category, url = row[:6]
            if source_id == 'affinity' and not name_match(title):
                held['nameDoesNotMatch'] += 1
                continue
            if not isinstance(lat,(int,float)) or not isinstance(lng,(int,float)) or not -90 <= lat <= 90 or not -180 <= lng <= 180:
                held['invalidCoordinates'] += 1
                continue
            key = (source_id,normalise(title),round(lat,5),round(lng,5))
            if key in seen:
                held['duplicate'] += 1
                continue
            seen.add(key)
            category, basis = category_for(title, old_category, source_id)
            rid = hashlib.sha256(repr(key).encode()).hexdigest()[:16]
            result['records'].append({'id':rid,'name':title,'lat':lat,'lng':lng,'place':detail,'category':category,'categoryBasis':basis,'sourceCategory':old_category,'source':source_id,'url':url if url.startswith(('https://','http://')) else ''})
        result['held'][source_id] = dict(held)
    (ROOT/'assets/market-data.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'mapped':len(result['records']), 'sources':dict(Counter(r['source'] for r in result['records'])),'categories':dict(Counter(r['category'] for r in result['records'])),'held':result['held']},indent=2))

if __name__ == '__main__':
    build()
