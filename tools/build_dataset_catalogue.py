"""Recommendations authored against every original page. No personal records are generated."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pages = json.loads((root/'assets/mockplus/pages.json').read_text(encoding='utf-8'))['pages']
chakras = [
    ('Red', 'Root', 'Embodiment, practical needs, place and stability'),
    ('Orange', 'Sacral', 'Creativity, enjoyment, relationship and change'),
    ('Yellow', 'Solar plexus', 'Agency, intentions, capability and action'),
    ('Green', 'Heart', 'Care, reciprocity, belonging and stewardship'),
    ('Blue', 'Throat', 'Expression, communication and shared understanding'),
    ('Indigo', 'Brow', 'Attention, interpretation, patterns and discernment'),
    ('Violet', 'Crown', 'Meaning, values, integration and wider perspective'),
]
steps = [
    ('self', 'Personal details and avatar', 'Avatar questions, preferences, embodiment, boundaries and values.'),
    ('people', 'People and relationships', 'Relationships, communication and commitments.'),
    ('time', 'Time and everyday life', 'Life events, schedules, counters and ceremonies.'),
    ('intent', 'Ideas into action', 'Goals, inspiration, learning and work.'),
    ('place', 'Places and environments', 'Locations, journeys, spatial anchors and observations.'),
    ('community', 'Care and participation', 'Community projects, services, contributions and resources.'),
    ('knowledge', 'Knowledge and reflection', 'Definitions, evidence, reflections and questions.'),
    ('systems', 'Tools and programs', 'Devices, experiments, automation steps and data organisation.'),
    ('assets', 'Bring your existing data', 'Media, exported tables, source references and discovery.'),
    ('allocate', 'Review and allocate', 'Choose a table, shell, side and facets or stack steps.'),
]
specs = []
def add(id, name, step, columns, refs, reasons, note=''):
    specs.append(dict(id=id,name=name,category=step,columns=columns.split('|'),sourceNumbers=refs,
                      chakraRelevance=[dict(shell=s,reason=r) for s,r in reasons],note=note))

add('preferences','Personal and interface preferences','self','Title|Preference|Context|Review date',[2,3,5,6,22,108],[(0,'Comfort and everyday stability.'),(2,'Choosing how the interface serves your intentions.')])
add('body','Body and avatar calibration','self','Title|Measurement|Unit|Method|Date|Asset',[45,93,106,107,108,110,111,112],[(0,'Embodiment and physical scale.'),(5,'Relating measurements to spatial perception.')],'Optional supplied measurements and avatar settings, not automatic biometric collection.')
add('boundaries','Boundaries and sharing intentions','self','Title|Information scope|Intended audience|Permission note|Review date',list(range(50,62))+[11,12,14,15,109],[(0,'Safety and personal boundaries.'),(3,'Respectful relationships.'),(4,'Making expectations explicit.')],'Records of intention do not enforce access control. Never store passwords or access tokens in these tables.')
add('values','Values and guiding principles','self','Title|Meaning|Example in practice|Question|Source',[94,95,99,100,101,102,103,104,105,123,124,129,134,135],[(6,'Coherence and overarching meaning.'),(3,'Care expressed through principles.'),(2,'Turning principles into choices.')],'Chakra tags are editable philosophical associations; they are not measurements or diagnoses.')
add('relationships','People, family and relationship links','people','Title|Relationship|Shared context|Important date|Notes',[34,59,60,72,73,75,82,109],[(3,'Belonging and reciprocity.'),(1,'Relational experience and shared enjoyment.'),(0,'Family roots and continuity.')])
add('communications','Communication and social records','people','Title|Platform|Date|Conversation or post|Asset|Audience',[49,50,62,64,65,66,67,68,69,70,71,72,73],[(4,'Expression and exchange.'),(3,'The relationships within those exchanges.'),(5,'Reflecting on communication patterns.')],'Import files you choose; no account login or social API connection is implied.')
add('commitments','Memberships and commitments','people','Title|Group|Role|Commitment|Review date',[127,129,131,132,133,145],[(3,'Mutual responsibility.'),(2,'Following through on chosen commitments.'),(6,'Alignment with wider purpose.')],'Historical campaign pages are source ideas, not evidence of current events or membership benefits.')
add('life-events','Birthdays and life events','time','Title|Person or subject|Date|Place|Meaning|Asset',[75,81,82,83],[(0,'Locating experience in a life history.'),(3,'Remembering people and relationships.'),(6,'Making meaning across time.')])
add('schedules','Tasks, schedules and reminders','time','Title|Date|Time|Repeat|Status|Instructions',[40,81,85,86],[(2,'Intentional action and follow-through.'),(0,'Stable rhythms of daily life.'),(4,'Prompts that communicate what is needed.')],'A stored reminder is not a running notification service.')
add('counters','Counters and milestones','time','Title|Value|Unit|Target|Date|Evidence',[81,83,84],[(2,'Progress against chosen aims.'),(5,'Interpreting observations and thresholds.')])
add('ceremonies','Ceremonies and significant occasions','time','Title|Date or season|People|Meaning|Place|Instructions',[75,81,87,129],[(3,'Care and shared belonging.'),(6,'Ritual meaning and continuity.'),(1,'Creative and felt expression.')])
add('goals','Goals, wishes and desired experiences','intent','Title|Why it matters|Next action|Target date|Status',[26,44,77,78,79,80],[(2,'Direction and chosen action.'),(1,'Desire, imagination and experience.'),(6,'Relating goals to values.')])
add('inspiration','Favourites and creative inspiration','intent','Title|Category|What resonates|Asset|Possible use',[41,56,69,76,140],[(1,'Creative possibility and enjoyment.'),(5,'Recognising resonant patterns.'),(4,'Giving ideas expression.')])
add('learning','Learning, skills and instruction sets','intent','Title|Topic|Source|Practice|Evidence|Instructions',[63,89,90],[(5,'Understanding and discernment.'),(2,'Developing usable capability.'),(4,'Articulating and teaching what is learned.')])
add('work','Work projects and deliverables','intent','Title|Role|Outcome|Next action|Due date|Status',[57,70,89,90,139,140,141,142,143,145],[(2,'Agency and execution.'),(4,'Coordination and clear deliverables.'),(3,'Contribution to other people.')])
add('places','Places, rooms and site records','place','Title|Location|Type|Access notes|Asset|Source',[96,97,117,118,119,120,121,122,139,143],[(0,'Grounding in place and material context.'),(5,'Understanding spatial relationships.'),(3,'Care for shared places.')])
add('spatial-anchors','Spatial anchors and mind-palace links','place','Title|Place|Position|Linked information|Asset',[9,93,107,117,118,119,120,121,122],[(5,'Spatial organisation and associative recall.'),(0,'Anchoring information to a place.'),(6,'Connecting parts into a coherent whole.')])
add('journeys','Journeys and travel plans','place','Title|Origin|Destination|Stops|Date|Purpose',[35,36,58,71,80,122],[(0,'Practical orientation and access.'),(2,'Planning a route to an intention.'),(1,'Exploration and experience.')])
add('environment','Weather and environmental observations','place','Title|Place|Date|Observation|Unit|Source',[31,91,92,122,130,143],[(0,'Conditions that affect daily life.'),(3,'Environmental care and stewardship.'),(5,'Comparing observations and patterns.')])
add('celestial','Celestial observations and symbolic reflections','place','Title|Date|Observation|Source|Interpretation',[82,88,95,98],[(5,'Observing cycles and their patterns.'),(6,'Reflecting on wider context.')],'Keep recorded astronomical observations separate from personal or cultural symbolic interpretation.')
add('community','Community projects and service needs','community','Title|Community|Need|Contribution|Next action|Source',[92,120,123,124,125,128,130,131,132,143],[(3,'Care, reciprocity and stewardship.'),(2,'Collective action.'),(6,'Shared purpose.')])
add('resources','Services, accommodation and resource offers','community','Title|Category|Provider|Place|Availability|Source',[44,48,138,139,140,141,142,143],[(0,'Material needs and available resources.'),(3,'Matching offers with community needs.'),(2,'Practical options for action.')])
add('funding','Funding, sponsorship and support options','community','Title|Support type|Provider|Eligibility|Closing date|Source',[23,24,25,27,126],[(0,'Material support and continuity.'),(2,'Resourcing chosen work.'),(3,'Reciprocity between supporters and communities.')],'Store source and review date. The original prototype does not establish that an offer is current.')
add('participation','Participation choices and declarations','community','Title|Initiative|Chosen role|Declaration|Date|Asset',[125,127,128,129,130,131,132,133,145],[(6,'Voluntary alignment with meaning.'),(4,'Stating intentions clearly.'),(3,'Participation with others.')],'Participation is optional; no declarations are pre-filled or submitted.')
add('accessibility','Accessibility and interaction preferences','self','Title|Preference or need|Context|Helpful adjustment|Review date',[22,29,32,42,93,108,109],[(0,'Comfort and access.'),(3,'Care and inclusion.'),(2,'Supporting personal agency.')])
add('wellbeing','Self-reported wellbeing observations','self','Title|Date|Observation|Context|Helpful action|Source',[38,83,108,115,142],[(0,'Embodied experience.'),(3,'Care for self and others.'),(5,'Reflecting on patterns without assuming causes.')],'Optional self-report; no diagnosis or emotional inference from appearance.')
add('reflection','Reflections, questions and interpretations','knowledge','Title|Observation|Interpretation|Question|Evidence|Date',[33,37,38,74,94,115],[(5,'Separating observations from interpretations.'),(6,'Integration and meaning.'),(3,'Compassionate reflection.')])
add('knowledge','Definitions, concepts and source notes','knowledge','Title|Definition or claim|Source|Evidence status|Related idea',[63,74,89,116],[(4,'Precise language.'),(5,'Understanding and evaluating ideas.'),(6,'Connecting knowledge into a larger perspective.')])
add('experiments','Algorithm experiments and evaluation records','systems','Title|Purpose|Input dataset|Method|Expected result|Observed result|Evidence',list(range(28,44))+[45,113,114,115,116],[(5,'Testing interpretations against evidence.'),(2,'Deliberate experimentation.'),(0,'Connection to measured conditions.')],'Source algorithm pages describe proposals. A table row does not install a model or infer identities.')
add('devices','Devices, storage and capacity','systems','Title|Device or location|Capability|Capacity|Unit|Last checked',[39,46,47,48],[(0,'Physical resources and dependable storage.'),(2,'Available means for action.'),(5,'Understanding capacity and constraints.')])
add('programs','Program steps and automation recipes','systems','Title|Inputs|Instructions|Expected output|Next step|Review rule',[7,8,9,13,16,17,18,19,20,21,28,39,40,48],[(2,'Sequencing intentional action.'),(4,'Explicit instructions and interfaces.'),(5,'Reasoning about dependencies and outcomes.')],'Stack order is readable by an agent; external tool execution still needs an authorised runner.')
add('table-register','Dataset register and facet allocations','systems','Title|Source|Meaning|Category|Preferred address|Review date',list(range(7,22))+[63,74,94,99,100,101,102,103,104,105],[(5,'Organisation and meaningful relationships.'),(6,'Coherence across datasets.'),(2,'Turning organisation into usable steps.')],'Every working shell remains 12 by 24. Colour tags can be many-to-many without duplicating a row.')
add('navigation','Navigation favourites and workspace views','systems','Title|Destination|Purpose|Context',[1,2,3,4,5,6,7,8,22,93],[(2,'Reaching an intended action.'),(5,'A clear mental map of the app.')],'Menu and empty shell pages organise other datasets rather than demanding extra personal information.')
add('media','Media assets and source files','assets','Title|Asset|Media type|Description|Source|Usage notes',[41,62,64,65,69,106,114,117,118,119,120,121,122,131,140],[(1,'Creative form and experience.'),(4,'Expression and communication.'),(5,'Evidence and memory cues.')])
add('imports','Imported and custom datasets','assets','Title|Details|Source|Asset|Instructions',[9,49,61,62,63,74],[(5,'Finding relationships across sources.'),(4,'Preserving meaning and provenance.'),(6,'Integration across domains.')],'CSV columns are retained. Create additional tables for data that does not fit a recommendation.')
add('provenance','Sources, provenance and permission notes','assets','Title|Source|Owner or contributor|Usage intention|Evidence|Review date',[11,12,14,15,50,51,52,53,54,55,56,57,58,59,60,61,144],[(4,'Traceable claims and clear permissions.'),(0,'Trustworthy foundations.'),(3,'Respect for contributors.')],'The historical ledger screen becomes a provenance recommendation; no transaction network is added.')
add('discovery','Searches, matches and opportunity reviews','assets','Title|Query or need|Result|Relevance|Evidence|Next action',[33,34,44,74,136,137,138],[(5,'Discernment and relevance.'),(2,'Choosing a useful next action.'),(3,'Connecting needs with people and offers.')])

coverage=[]
for n,p in enumerate(pages,1):
    matches=[s for s in specs if n in s['sourceNumbers']]
    if not matches: raise ValueError('Unreviewed page: '+str(n)+' '+p['name'])
    coverage.append(dict(pageId=p['id'],page=p['name'],datasets=[s['id'] for s in matches],
                         role='navigation or presentation' if n in list(range(1,22))+[93,94,95,99,100,101,102,103,104,105] else 'dataset or proposed capability'))
for s in specs:
    s['sourcePages']=[pages[n-1]['id'] for n in s.pop('sourceNumbers')]
reader_steps = [
 dict(id='birthday',title='Add your birthday',description='Your date of birth.',datasets=['life-events']),
 dict(id='avatar',title='Build your avatar',description='The eight questions from your original Avatar Questionnaire.',datasets=['body','boundaries','accessibility']),
 dict(id='family',title='Add your family',description='Names and relationships from Build Your Family Tree.',datasets=['relationships','commitments']),
 dict(id='dates',title='Add key dates',description='Birthdays, milestones and ceremonies.',datasets=['life-events','ceremonies']),
 dict(id='timing',title='Timing and signals',description='Schedules, reminders, counters and actions.',datasets=['schedules','counters']),
 dict(id='favourites',title='Add favourites',description='Books, music, films, places and experiences you enjoy.',datasets=['inspiration']),
 dict(id='skills',title='Add your skills',description='Skills you have and skills you are learning.',datasets=['learning','work']),
 dict(id='goals',title='Add your goals',description='Wish lists, life goals and things you want to do.',datasets=['goals']),
 dict(id='travel',title='Your travels',description='Where have you travelled, and where do you want to go?',datasets=['journeys']+[s['id'] for s in specs if s['id']!='journeys']),
 dict(id='allocate',title='Place your data',description='Allocate your tables to facets or stack steps.',datasets=[]),
]
catalogue=dict(format='aura-dataset-catalogue/1',basis='Recommendations from all 145 original page records. Philosophical associations are editable suggestions, not measured properties.',
               chakras=[dict(shell=i,colour=c,name=n,meaning=m) for i,(c,n,m) in enumerate(chakras)],
               steps=reader_steps,datasets=specs,pageReview=coverage)
(root/'assets/dataset-catalogue.json').write_text(json.dumps(catalogue,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# Recommended Aura datasets and chakra associations','',catalogue['basis'],'',
       'The seven chakras are used here as complementary philosophical perspectives. A dataset may relate to several; the user chooses its actual facet or stack address. Inside and outside remain address spaces, not access-control enforcement.','',
       '## Philosophical perspectives','', '| Colour / chakra | Perspective |','| --- | --- |']
lines += [f'| {c} / {n} | {m} |' for c,n,m in chakras]
for step,title,description in steps:
    lines += ['', '## '+title,'',description,'']
    if step=='allocate':
        lines += ['Review the table and its source, edit the suggested chakra tags, choose a shell and side, then choose consecutive facets or an outward stack. Preview the placement before allocating. Existing allocations are retained; repeated allocation adds only new rows. The complete tables and QuickStart position travel with the normal project backup.']
    for s in specs:
        if s['category']!=step:continue
        lines += ['### '+s['name'],'','Suggested columns: '+', '.join(s['columns'])+'.','']
        lines += [f"- {chakras[r['shell']][0]} ({chakras[r['shell']][1]}): {r['reason']}" for r in s['chakraRelevance']]
        if s['note']:lines += ['',s['note']]
        lines += ['', 'Source screens: '+', '.join(next(p['name'] for p in pages if p['id']==id) for id in s['sourcePages'])+'.','']
lines += ['## Review of every original page','','| Original page | Recommended datasets |','| --- | --- |']
byid={s['id']:s['name'] for s in specs}
lines += ['| '+p['page']+' (`'+p['pageId']+'`) | '+', '.join(byid[d] for d in p['datasets'])+' |' for p in coverage]
(root/'DATASET-CATALOGUE.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'{len(specs)} dataset recommendations; {len(coverage)} original pages reviewed; {len(steps)} QuickStart cards.')
