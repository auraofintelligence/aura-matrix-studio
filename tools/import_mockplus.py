"""Read the original Mockplus archive without modifying it.

Export original page coordinates, properties, link areas and referenced artwork.
No workbook instructions or archived prose is executed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import unquote_plus
import xml.etree.ElementTree as ET
import zipfile


def decode(value):
    return unquote_plus(value or '')


def export(source, destination):
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(source) as archive:
        main = ET.fromstring(archive.read('Main.mpk'))
        assets = {}
        for name in archive.namelist():
            if name.startswith('0EDCD3EB-42DB-412B-9411-E5DD751EB4BA/'):
                assets[Path(name).name] = name
        used, pages = set(), []

        def control(element):
            data = dict(element.attrib)
            data['properties'] = {child.tag: decode(child.text) for child in element
                                  if not len(child) and child.tag != 'links'}
            font = element.find('font')
            data['font'] = {k: decode(v) for k, v in font.attrib.items()} if font is not None else {}
            data['children'] = [control(c) for c in element.findall('groupChildrenDescriptors/control')]
            data['links'] = []
            for link in element.findall('links/link'):
                areas = [dict(a.attrib) for a in link.findall('area')]
                data['links'].append({'target': link.get('targetPageID', ''),
                                      'title': decode(link.get('title')), 'areas': areas})
            asset = data['properties'].get('URL', '')
            if asset:
                if asset not in assets:
                    raise ValueError('Missing original artwork: ' + asset)
                used.add(asset)
            return data

        def page(element, parent=None):
            identifier = element.get('ID')
            mockup = ET.fromstring(archive.read('MBX/' + identifier + '.mbx'))
            params = mockup.find('param')
            pages.append({'id': identifier, 'name': element.get('name'), 'parent': parent,
                          'width': int(mockup.get('measureW')), 'height': int(mockup.get('measureH')),
                          'orientation': mockup.get('screenOrientation'),
                          'background': params.findtext('backgroundColor', '4294967295'),
                          'fontSize': int(params.findtext('fontSize', '0')) or 14,
                          'controls': [control(c) for c in mockup.findall('controls/control')]})
            for child in element.findall('page'):
                page(child, identifier)

        for element in main.findall('pages/page'):
            page(element)
        for asset in sorted(used):
            if not re.fullmatch(r'[A-Za-z0-9-]+\.(?:png|jpg|svg|gif)', asset, re.I):
                raise ValueError('Unexpected asset filename: ' + asset)
            (destination / asset).write_bytes(archive.read(assets[asset]))
        result = {'format': 'aura-mockplus-layout/1', 'source': source.name,
                  'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                  'home': '72917D84-7C55-42C9-A552-27AC4CB15FE7', 'pages': pages}
        (destination / 'pages.json').write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(f'{len(pages)} original pages; {len(used)} original artwork files.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    export(args.source, args.destination)
